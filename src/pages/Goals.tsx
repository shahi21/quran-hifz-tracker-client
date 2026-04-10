import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

type Goal = {
  id: string;
  goalType: "DAILY_MEMORIZATION" | "WEEKLY_MEMORIZATION" | "DAILY_STUDY_TIME" | "WEEKLY_STUDY_TIME";
  targetAyahs: number | null;
  targetMinutes: number | null;
  isCompleted: boolean;
  currentProgress: number;
};

function formatGoalType(goalType: Goal["goalType"]) {
  return goalType.replaceAll("_", " ").toLowerCase();
}

export function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalType, setGoalType] = useState<Goal["goalType"]>("DAILY_MEMORIZATION");
  const [targetAyahs, setTargetAyahs] = useState(5);
  const [targetMinutes, setTargetMinutes] = useState(30);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "COMPLETED">("ACTIVE");

  const isStudyTimeGoal = useMemo(() => goalType.includes("STUDY_TIME"), [goalType]);

  async function loadGoals() {
    const data = await api<Goal[]>("/goals", { authenticated: true });
    setGoals(data);
  }

  useEffect(() => {
    loadGoals().catch(() => null);
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await api("/goals", {
      method: "POST",
      authenticated: true,
      body: JSON.stringify({
        goalType,
        targetAyahs: isStudyTimeGoal ? undefined : targetAyahs,
        targetMinutes: isStudyTimeGoal ? targetMinutes : undefined,
        startDate: new Date().toISOString(),
      }),
    });
    await loadGoals();
  }

  const displayedGoals = goals.filter((goal) => (activeTab === "ACTIVE" ? !goal.isCompleted : goal.isCompleted));

  return (
    <div className="page-stack">
      <section className="page-header">
        <p className="eyebrow">Goals</p>
        <h2>Set daily and weekly targets with visible progress</h2>
      </section>
      <section className="panel-grid">
        <form className="card form-grid" onSubmit={handleSubmit}>
          <div className="mini-chart-head">
            <h3>Create a goal</h3>
            <span className="muted">Auto-updated from activity</span>
          </div>
          <label>
            Goal Type
            <select value={goalType} onChange={(event) => setGoalType(event.target.value as Goal["goalType"])}>
              <option value="DAILY_MEMORIZATION">Daily memorization</option>
              <option value="WEEKLY_MEMORIZATION">Weekly memorization</option>
              <option value="DAILY_STUDY_TIME">Daily study time</option>
              <option value="WEEKLY_STUDY_TIME">Weekly study time</option>
            </select>
          </label>
          {isStudyTimeGoal ? (
            <label>
              Target Minutes
              <input
                type="number"
                min={1}
                value={targetMinutes}
                onChange={(event) => setTargetMinutes(Number(event.target.value))}
              />
            </label>
          ) : (
            <label>
              Target Ayahs
              <input type="number" min={1} value={targetAyahs} onChange={(event) => setTargetAyahs(Number(event.target.value))} />
            </label>
          )}
          <button className="primary-button" type="submit">
            Create goal
          </button>
        </form>

        <article className="card">
          <div className="mini-chart-head">
            <h3>Your goals</h3>
            <div className="tabs" role="tablist" aria-label="Goal view">
              <button
                type="button"
                className={`tab ${activeTab === "ACTIVE" ? "active" : ""}`}
                onClick={() => setActiveTab("ACTIVE")}
              >
                Active
              </button>
              <button
                type="button"
                className={`tab ${activeTab === "COMPLETED" ? "active" : ""}`}
                onClick={() => setActiveTab("COMPLETED")}
              >
                Completed
              </button>
            </div>
          </div>

          <ul className="goal-list stack-sm">
            {displayedGoals.map((goal) => {
              const target = goal.targetAyahs ?? goal.targetMinutes ?? 0;
              const progress = goal.currentProgress ?? 0;
              const pct = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;
              const unit = goal.targetMinutes ? "mins" : "ayahs";

              return (
                <li key={goal.id} className="goal-item">
                  <div className="goal-item-head">
                    <strong>{formatGoalType(goal.goalType)}</strong>
                    <div className="goal-item-actions">
                      <span className={`pill ${goal.isCompleted ? "pill-done" : "pill-live"}`}>
                        {goal.isCompleted ? "Done" : "Active"}
                      </span>
                      <button
                        type="button"
                        className="ghost-button"
                        style={{ padding: "0.3rem 0.7rem", fontSize: "0.85rem" }}
                        onClick={async () => {
                          await api(`/goals/${goal.id}/status`, {
                            method: "PUT",
                            authenticated: true,
                            body: JSON.stringify({ isCompleted: !goal.isCompleted }),
                          });
                          await loadGoals();
                        }}
                      >
                        {goal.isCompleted ? "Undo" : "Mark done"}
                      </button>
                    </div>
                  </div>

                  <div className="goal-meter">
                    <div className="goal-meter-fill" style={{ width: `${pct}%` }} />
                  </div>

                  <div className="goal-row-bottom muted">
                    <span>
                      {progress} / {target} {unit}
                    </span>
                    <span>{pct}%</span>
                  </div>
                </li>
              );
            })}

            {displayedGoals.length === 0 ? <li className="muted">No goals in this view.</li> : null}
          </ul>
        </article>
      </section>
    </div>
  );
}
