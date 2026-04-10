import { useEffect, useState } from "react";
import { api } from "../api/client";

type CalendarResponse = {
  streak: { current: number; longest: number };
  activity: Array<{ id: string; activityDate: string; memorizedAyahs: number; revisedAyahs: number; studyMinutes: number }>;
};

export function CalendarPage() {
  const [data, setData] = useState<CalendarResponse | null>(null);

  useEffect(() => {
    api<CalendarResponse>("/stats/calendar", { authenticated: true }).then(setData).catch(() => null);
  }, []);

  return (
    <div className="page-stack">
      <section className="page-header">
        <p className="eyebrow">Calendar</p>
        <h2>Consistency over time</h2>
      </section>
      <section className="panel-grid">
        <article className="card">
          <h3>Streaks</h3>
          <p>Current streak: {data?.streak.current ?? 0} days</p>
          <p>Longest streak: {data?.streak.longest ?? 0} days</p>
        </article>
        <article className="card">
          <h3>This month</h3>
          <ul className="simple-list">
            {(data?.activity ?? []).map((item) => (
              <li key={item.id}>
                <span>{new Date(item.activityDate).toLocaleDateString()}</span>
                <strong>{item.memorizedAyahs + item.revisedAyahs} ayahs</strong>
                <span>{item.studyMinutes} mins</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}

