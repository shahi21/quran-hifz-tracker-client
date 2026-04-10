import { FormEvent, useEffect, useState } from "react";
import { api } from "../api/client";

type Revision = {
  id: string;
  revisionDate: string;
  surahId: number;
  startAyah: number;
  endAyah: number;
  durationMins: number;
  accuracyRating?: number | null;
};

const initialForm = {
  revisionDate: new Date().toISOString().slice(0, 10),
  surahId: 1,
  startAyah: 1,
  endAyah: 7,
  durationMins: 20,
  accuracyRating: 4,
};

export function RevisionsPage() {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [form, setForm] = useState(initialForm);

  async function loadRevisions() {
    const data = await api<Revision[]>("/revisions", { authenticated: true });
    setRevisions(data);
  }

  useEffect(() => {
    loadRevisions().catch(() => null);
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await api("/revisions", {
      method: "POST",
      authenticated: true,
      body: JSON.stringify(form),
    });
    setForm(initialForm);
    await loadRevisions();
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <p className="eyebrow">Revisions</p>
        <h2>Log what you revised today</h2>
      </section>
      <section className="panel-grid">
        <form className="card form-grid" onSubmit={handleSubmit}>
          <label>
            Date
            <input
              type="date"
              value={form.revisionDate}
              onChange={(event) => setForm({ ...form, revisionDate: event.target.value })}
            />
          </label>
          <label>
            Surah
            <input
              type="number"
              value={form.surahId}
              onChange={(event) => setForm({ ...form, surahId: Number(event.target.value) })}
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
            Accuracy (1-5)
            <input
              type="number"
              value={form.accuracyRating}
              min={1}
              max={5}
              onChange={(event) => setForm({ ...form, accuracyRating: Number(event.target.value) })}
            />
          </label>
          <button className="primary-button" type="submit">
            Save revision
          </button>
        </form>
        <article className="card">
          <h3>Recent revisions</h3>
          <ul className="simple-list">
            {revisions.map((revision) => (
              <li key={revision.id}>
                <span>{new Date(revision.revisionDate).toLocaleDateString()}</span>
                <strong>
                  {revision.surahId}:{revision.startAyah} - {revision.surahId}:{revision.endAyah}
                </strong>
                <span>{revision.durationMins} mins</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}

