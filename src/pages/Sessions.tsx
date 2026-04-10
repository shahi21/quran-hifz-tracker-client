import { FormEvent, useEffect, useState } from "react";
import { api } from "../api/client";

type Session = {
  id: string;
  sessionDate: string;
  startSurahId: number;
  startAyah: number;
  endSurahId: number;
  endAyah: number;
  durationMins: number;
};

const initialForm = {
  sessionDate: new Date().toISOString().slice(0, 10),
  startSurahId: 1,
  startAyah: 1,
  endSurahId: 1,
  endAyah: 7,
  durationMins: 30,
  memorizedAyahs: 7,
};

export function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [form, setForm] = useState(initialForm);

  async function loadSessions() {
    const data = await api<Session[]>("/sessions", { authenticated: true });
    setSessions(data);
  }

  useEffect(() => {
    loadSessions().catch(() => null);
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await api("/sessions", {
      method: "POST",
      authenticated: true,
      body: JSON.stringify(form),
    });
    setForm(initialForm);
    await loadSessions();
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <p className="eyebrow">Hifz Sessions</p>
        <h2>Log what you memorized today</h2>
      </section>
      <section className="panel-grid">
        <form className="card form-grid" onSubmit={handleSubmit}>
          <label>
            Date
            <input
              type="date"
              value={form.sessionDate}
              onChange={(event) => setForm({ ...form, sessionDate: event.target.value })}
            />
          </label>
          <label>
            Start Surah
            <input
              type="number"
              value={form.startSurahId}
              onChange={(event) => setForm({ ...form, startSurahId: Number(event.target.value) })}
            />
          </label>
          <label>
            End Surah
            <input
              type="number"
              value={form.endSurahId}
              onChange={(event) => setForm({ ...form, endSurahId: Number(event.target.value) })}
            />
          </label>
          <label>
            Start Ayah
            <input
              type="number"
              value={form.startAyah}
              onChange={(event) => setForm({ ...form, startAyah: Number(event.target.value) })}
            />
          </label>
          <label>
            End Ayah
            <input
              type="number"
              value={form.endAyah}
              onChange={(event) => setForm({ ...form, endAyah: Number(event.target.value) })}
            />
          </label>
          <label>
            Minutes
            <input
              type="number"
              value={form.durationMins}
              onChange={(event) => setForm({ ...form, durationMins: Number(event.target.value) })}
            />
          </label>
          <label>
            Memorized Ayahs
            <input
              type="number"
              value={form.memorizedAyahs}
              onChange={(event) => setForm({ ...form, memorizedAyahs: Number(event.target.value) })}
            />
          </label>
          <button className="primary-button" type="submit">
            Save session
          </button>
        </form>
        <article className="card">
          <h3>Recent sessions</h3>
          <ul className="simple-list">
            {sessions.map((session) => (
              <li key={session.id}>
                <span>{new Date(session.sessionDate).toLocaleDateString()}</span>
                <strong>
                  {session.startSurahId}:{session.startAyah} - {session.endSurahId}:{session.endAyah}
                </strong>
                <span>{session.durationMins} mins</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}

