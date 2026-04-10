import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { StatCard } from "../components/StatCard";

type DashboardData = {
  overview: {
    totalAyahsMemorized: number;
    ayahsInProgress: number;
    totalSessionsLogged: number;
    totalRevisionsLogged: number;
    currentStreak: number;
    longestStreak: number;
  };
  gamification: {
    xp: number;
    level: number;
    baseXp: number;
    nextXp: number;
    progress: number;
    achievements: Array<{
      id: string;
      title: string;
      description: string;
      target: number;
      progress: number;
      unlocked: boolean;
    }>;
    quests: Array<{
      id: string;
      title: string;
      done: boolean;
    }>;
  };
  weeklyProgress: Array<{ date: string; ayahs: number; minutes: number }>;
  monthlyProgress: Array<{ date: string; ayahs: number; minutes: number }>;
  goals: Array<{
    id: string;
    goalType: "DAILY_MEMORIZATION" | "WEEKLY_MEMORIZATION" | "DAILY_STUDY_TIME" | "WEEKLY_STUDY_TIME";
    targetAyahs: number | null;
    targetMinutes: number | null;
    currentProgress: number;
    isCompleted: boolean;
  }>;
  recentActivity: Array<{ id: string; activityDate: string; memorizedAyahs: number; revisedAyahs: number; studyMinutes: number }>;
};

type ActivityItem = DashboardData["recentActivity"][number];

function dateKeyLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shortDow(date: Date) {
  return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date);
}

function formatGoalLabel(goalType: DashboardData["goals"][number]["goalType"]) {
  return goalType.replaceAll("_", " ").toLowerCase();
}

function dedupeActivity(items: ActivityItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${dateKeyLocal(new Date(item.activityDate))}|${item.memorizedAyahs}|${item.revisedAyahs}|${item.studyMinutes}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [levelUp, setLevelUp] = useState(false);

  useEffect(() => {
    api<DashboardData>("/stats/dashboard", { authenticated: true }).then(setData).catch(() => null);
  }, []);

  useEffect(() => {
    const currentLevel = data?.gamification?.level;
    if (!currentLevel) return;

    const key = "hifz_last_level";
    const prev = Number(localStorage.getItem(key) ?? "0");
    if (currentLevel > prev) {
      localStorage.setItem(key, String(currentLevel));
      setLevelUp(true);
      const t = window.setTimeout(() => setLevelUp(false), 2200);
      return () => window.clearTimeout(t);
    }

    if (prev === 0) {
      localStorage.setItem(key, String(currentLevel));
    }
  }, [data?.gamification?.level]);

  const weekSeries = useMemo(() => {
    const today = new Date();
    const dayKeys = Array.from({ length: 7 }).map((_, index) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - index));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const map = new Map<string, { ayahs: number; minutes: number }>();
    for (const item of data?.weeklyProgress ?? []) {
      const d = new Date(item.date);
      map.set(dateKeyLocal(d), { ayahs: item.ayahs, minutes: item.minutes });
    }

    const series = dayKeys.map((d) => {
      const key = dateKeyLocal(d);
      const value = map.get(key) ?? { ayahs: 0, minutes: 0 };
      return { date: d, ...value };
    });

    const maxAyahs = Math.max(1, ...series.map((s) => s.ayahs));
    const maxMinutes = Math.max(1, ...series.map((s) => s.minutes));
    const totalAyahs = series.reduce((sum, s) => sum + s.ayahs, 0);
    const totalMinutes = series.reduce((sum, s) => sum + s.minutes, 0);

    return { series, maxAyahs, maxMinutes, totalAyahs, totalMinutes };
  }, [data?.weeklyProgress]);

  const todayTotals = useMemo(() => {
    const todayKey = dateKeyLocal(new Date());
    const todayItems = dedupeActivity((data?.recentActivity ?? []).filter((item) => dateKeyLocal(new Date(item.activityDate)) === todayKey));
    if (todayItems.length === 0) return { memorized: 0, revised: 0, minutes: 0, totalAyahs: 0 };

    const memorized = todayItems.reduce((sum, item) => sum + item.memorizedAyahs, 0);
    const revised = todayItems.reduce((sum, item) => sum + item.revisedAyahs, 0);
    const minutes = todayItems.reduce((sum, item) => sum + item.studyMinutes, 0);
    return { memorized, revised, minutes, totalAyahs: memorized + revised };
  }, [data?.recentActivity]);

  const weekTotals = useMemo(() => {
    const today = new Date();
    const dayKeys = new Set(
      Array.from({ length: 7 }).map((_, index) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - index));
        d.setHours(0, 0, 0, 0);
        return dateKeyLocal(d);
      }),
    );

    const items = dedupeActivity((data?.recentActivity ?? []).filter((item) => dayKeys.has(dateKeyLocal(new Date(item.activityDate)))));
    const memorized = items.reduce((sum, item) => sum + item.memorizedAyahs, 0);
    const revised = items.reduce((sum, item) => sum + item.revisedAyahs, 0);
    const minutes = items.reduce((sum, item) => sum + item.studyMinutes, 0);
    return { memorized, revised, minutes, totalAyahs: memorized + revised };
  }, [data?.recentActivity]);

  const activityList = useMemo(() => dedupeActivity(data?.recentActivity ?? []), [data?.recentActivity]);

  const monthSeries = useMemo(() => {
    const today = new Date();
    const dayKeys = Array.from({ length: 30 }).map((_, index) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (29 - index));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const map = new Map<string, { ayahs: number; minutes: number }>();
    for (const item of data?.monthlyProgress ?? []) {
      const d = new Date(item.date);
      map.set(dateKeyLocal(d), { ayahs: item.ayahs, minutes: item.minutes });
    }

    return dayKeys.map((d) => {
      const key = dateKeyLocal(d);
      const value = map.get(key) ?? { ayahs: 0, minutes: 0 };
      return { date: d, ...value };
    });
  }, [data?.monthlyProgress]);

  const monthMomentum = useMemo(() => {
    const points = monthSeries.map((item) => {
      const score = item.ayahs * 2 + item.minutes / 5;
      return { ...item, score };
    });
    const maxScore = Math.max(1, ...points.map((p) => p.score));
    const totalAyahs = points.reduce((sum, p) => sum + p.ayahs, 0);
    const totalMinutes = points.reduce((sum, p) => sum + p.minutes, 0);
    const activeDays = points.filter((p) => p.ayahs > 0 || p.minutes > 0).length;
    return { points, maxScore, totalAyahs, totalMinutes, activeDays };
  }, [monthSeries]);

  return (
    <div className="page-stack">
      <section className={`dashboard-hero ${levelUp ? "level-up" : ""}`}>
        <div className="dashboard-hero-top">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h2 className="dashboard-title">Your daily accountability snapshot</h2>
            <p className="muted">
              Today: <strong>{todayTotals.memorized}</strong> memorized, <strong>{todayTotals.revised}</strong> revised,{" "}
              <strong>{todayTotals.minutes}</strong> minutes.
            </p>
          </div>
          <div className="dashboard-actions">
            <Link to="/sessions" className="primary-button">
              Log hifz
            </Link>
            <Link to="/revisions" className="ghost-button">
              Log revision
            </Link>
          </div>
        </div>

        <div className="dashboard-hero-bottom">
          <div className="mini-chart card">
            <div className="mini-chart-head">
              <h3>This week</h3>
              <p className="muted">
                {weekTotals.memorized} memorized, {weekTotals.revised} revised, {weekTotals.minutes} mins
              </p>
            </div>
            <div className="bars">
              {weekSeries.series.map((point) => {
                const ayahHeight = Math.round((point.ayahs / weekSeries.maxAyahs) * 100);
                const minuteHeight = Math.round((point.minutes / weekSeries.maxMinutes) * 100);
                return (
                  <div key={dateKeyLocal(point.date)} className="bar-col" title={`${point.ayahs} ayahs, ${point.minutes} mins`}>
                    <div className="bar-pair">
                      <div className="bar bar-ayah" style={{ height: `${ayahHeight}%` }} />
                      <div className="bar bar-min" style={{ height: `${minuteHeight}%` }} />
                    </div>
                    <span className="bar-label">{shortDow(point.date)}</span>
                  </div>
                );
              })}
            </div>
            <p className="muted" style={{ margin: 0 }}>
              Left bar: ayahs. Right bar: minutes.
            </p>
          </div>

          <div className="card dashboard-right">
            <div className="xp-card">
              <div className="xp-head">
                <div>
                  <p className="eyebrow">Level</p>
                  <h3 style={{ margin: 0 }}>
                    {data?.gamification?.level ?? 1} <span className="muted">({data?.gamification?.xp ?? 0} xp)</span>
                  </h3>
                </div>
                {levelUp ? <span className="pill pill-done">Level up</span> : <span className="pill pill-live">Keep going</span>}
              </div>
              <div className="xp-meter" aria-label="XP progress">
                <div className="xp-meter-fill" style={{ width: `${Math.round((data?.gamification?.progress ?? 0) * 100)}%` }} />
              </div>
              <div className="xp-foot muted">
                <span>{data?.gamification?.baseXp ?? 0}</span>
                <span>Next: {data?.gamification?.nextXp ?? 0}</span>
              </div>
            </div>

            <div className="quests">
              <div className="mini-chart-head">
                <h3>Daily quests</h3>
                <span className="muted">Today</span>
              </div>
              <ul className="quest-list">
                {(data?.gamification?.quests ?? []).map((quest) => (
                  <li key={quest.id} className={`quest ${quest.done ? "quest-done" : ""}`}>
                    <span className="quest-dot" aria-hidden="true" />
                    <span>{quest.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard label="Memorized" value={data?.overview.totalAyahsMemorized ?? 0} hint="Ayahs marked complete" />
        <StatCard label="In Progress" value={data?.overview.ayahsInProgress ?? 0} hint="Ayahs still being strengthened" />
        <StatCard label="Sessions" value={data?.overview.totalSessionsLogged ?? 0} hint="Memorization logs recorded" />
        <StatCard label="Revisions" value={data?.overview.totalRevisionsLogged ?? 0} hint="Revision logs completed" />
        <StatCard label="Current Streak" value={data?.overview.currentStreak ?? 0} hint="Consecutive active days" />
        <StatCard label="Longest Streak" value={data?.overview.longestStreak ?? 0} hint="Best consistency run" />
      </section>

      <section className="panel-grid">
        <article className="card">
          <div className="mini-chart-head">
            <h3>Achievements</h3>
            <span className="muted">{(data?.gamification?.achievements ?? []).filter((a) => a.unlocked).length} unlocked</span>
          </div>
          <div className="ach-grid">
            {(data?.gamification?.achievements ?? []).map((a) => {
              const pct = a.target > 0 ? Math.min(100, Math.round((a.progress / a.target) * 100)) : 0;
              return (
                <div key={a.id} className={`ach ${a.unlocked ? "ach-on" : ""}`} title={a.description}>
                  <div className="ach-top">
                    <strong>{a.title}</strong>
                    <span className={`pill ${a.unlocked ? "pill-done" : "pill-live"}`}>{a.unlocked ? "Unlocked" : `${pct}%`}</span>
                  </div>
                  <p className="muted" style={{ margin: 0 }}>
                    {a.description}
                  </p>
                  <div className="goal-meter" style={{ marginTop: "0.7rem" }}>
                    <div className="goal-meter-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="card">
          <h3>Recent activity</h3>
          <ul className="simple-list">
            {activityList.map((item) => (
              <li key={item.id}>
                <span>{new Date(item.activityDate).toLocaleDateString()}</span>
                <strong>
                  {item.memorizedAyahs} mem / {item.revisedAyahs} rev
                </strong>
                <span>{item.studyMinutes} mins</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="card">
          <h3>Momentum (last 30 days)</h3>
          <p className="muted">Clear daily activity bars using ayahs + study time.</p>
          <div className="mini-chart-head">
            <span className="muted">{monthMomentum.activeDays} active days</span>
            <span className="muted">
              {monthMomentum.totalAyahs} ayahs, {monthMomentum.totalMinutes} mins
            </span>
          </div>
          <div className="momentum-bars">
            {monthMomentum.points.map((item) => {
              const height = Math.max(4, Math.round((item.score / monthMomentum.maxScore) * 100));
              const isActive = item.ayahs > 0 || item.minutes > 0;
              return (
                <div
                  key={dateKeyLocal(item.date)}
                  className={`momentum-bar ${isActive ? "is-active" : ""}`}
                  style={{ height: `${height}%` }}
                  title={`${item.date.toLocaleDateString()}: ${item.ayahs} ayahs, ${item.minutes} mins`}
                />
              );
            })}
          </div>
          <p className="muted">Lower bars mean lighter days; empty days stay visible for context.</p>
        </article>
      </section>
    </div>
  );
}
