import { FormEvent, useEffect, useMemo, useState } from "react";
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

type Surah = {
  id: number;
  ayahCount: number;
};

const initialForm = {
  sessionDate: new Date().toISOString().slice(0, 10),
  startSurahId: 1,
  startAyah: 1,
  endSurahId: 1,
  endAyah: 7,
  durationMins: 30,
};

export function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [form, setForm] = useState(initialForm);

  const ayahCountMap = useMemo(() => new Map(surahs.map((surah) => [surah.id, surah.ayahCount])), [surahs]);

  const memorizedAyahs = useMemo(() => {
    const startSurah = Number.isFinite(form.startSurahId) ? form.startSurahId : 1;
    const endSurah = Number.isFinite(form.endSurahId) ? form.endSurahId : 1;
    const startAyah = Number.isFinite(form.startAyah) ? form.startAyah : 1;
    const endAyah = Number.isFinite(form.endAyah) ? form.endAyah : 1;

    const fromSurah = Math.min(startSurah, endSurah);
    const toSurah = Math.max(startSurah, endSurah);
    const fromAyah = startSurah <= endSurah ? startAyah : endAyah;
    const toAyah = startSurah <= endSurah ? endAyah : startAyah;

    if (fromSurah === toSurah) {
      return Math.max(0, Math.abs(toAyah - fromAyah) + 1);
    }

    let total = 0;
    for (let surahId = fromSurah; surahId <= toSurah; surahId += 1) {
      const ayahCount = ayahCountMap.get(surahId);
      if (!ayahCount) continue;

      if (surahId === fromSurah) {
        total += Math.max(0, ayahCount - fromAyah + 1);
      } else if (surahId === toSurah) {
        total += Math.max(0, toAyah);
      } else {
        total += ayahCount;
      }
    }
    return total;
  }, [ayahCountMap, form.endAyah, form.endSurahId, form.startAyah, form.startSurahId]);

  async function loadSessions() {
    const data = await api<Session[]>("/sessions", { authenticated: true });
    setSessions(data);
  }

  useEffect(() => {
    loadSessions().catch(() => null);
    api<Surah[]>("/surahs", { authenticated: true }).then(setSurahs).catch(() => null);
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await api("/sessions", {
      method: "POST",
      authenticated: true,
      body: JSON.stringify({ ...form, memorizedAyahs }),
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
            <input type="number" value={memorizedAyahs} readOnly />
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
