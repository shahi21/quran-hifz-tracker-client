import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";

type AyahStatus = "NOT_STARTED" | "IN_PROGRESS" | "MEMORIZED" | "REVISED" | "WEAK";

type AyahProgress = {
  ayahNumber: number;
  status: AyahStatus;
  confidenceScore?: number | null;
  notes?: string | null;
};

type SurahDetails = {
  id: number;
  englishName: string;
  arabicName: string;
  ayahCount: number;
  revelationType: string;
  ayahProgress: AyahProgress[];
};

const statusOptions: Array<{ value: AyahStatus; label: string }> = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "MEMORIZED", label: "Memorized" },
  { value: "REVISED", label: "Revised" },
  { value: "WEAK", label: "Weak" },
];

export function SurahDetailsPage() {
  const params = useParams();
  const surahId = Number(params.id);
  const [surah, setSurah] = useState<SurahDetails | null>(null);
  const [savingAyah, setSavingAyah] = useState<number | null>(null);

  const progressMap = useMemo(() => {
    const map = new Map<number, AyahProgress>();
    for (const item of surah?.ayahProgress ?? []) {
      map.set(item.ayahNumber, item);
    }
    return map;
  }, [surah?.ayahProgress]);

  const progressSummary = useMemo(() => {
    let memorized = 0;
    let inProgress = 0;
    let revised = 0;
    let weak = 0;

    for (const item of surah?.ayahProgress ?? []) {
      if (item.status === "MEMORIZED") memorized += 1;
      if (item.status === "IN_PROGRESS") inProgress += 1;
      if (item.status === "REVISED") revised += 1;
      if (item.status === "WEAK") weak += 1;
    }

    return { memorized, inProgress, revised, weak };
  }, [surah?.ayahProgress]);

  useEffect(() => {
    if (!Number.isFinite(surahId) || surahId <= 0) return;
    api<SurahDetails>(`/surahs/${surahId}`, { authenticated: true }).then(setSurah).catch(() => null);
  }, [surahId]);

  async function updateStatus(ayahNumber: number, status: AyahStatus) {
    if (!surah) return;
    setSavingAyah(ayahNumber);
    try {
      await api("/ayahs/progress", {
        method: "PUT",
        authenticated: true,
        body: JSON.stringify({ surahId, ayahNumber, status }),
      });

      setSurah((prev) => {
        if (!prev) return prev;
        const next = prev.ayahProgress.filter((item) => item.ayahNumber !== ayahNumber);
        next.push({ ayahNumber, status });
        next.sort((a, b) => a.ayahNumber - b.ayahNumber);
        return { ...prev, ayahProgress: next };
      });
    } finally {
      setSavingAyah(null);
    }
  }

  if (!surah) return <div className="screen-center">Loading...</div>;

  return (
    <div className="page-stack">
      <section className="page-header">
        <Link to="/surahs" className="back-link">
          {"<- Back"}
        </Link>
        <div className="surah-topline">
          <h2>{surah.englishName}</h2>
          <span className="arabic-name">{surah.arabicName}</span>
        </div>
        <p className="muted">
          {surah.ayahCount} ayahs - {surah.revelationType} - Surah {surah.id}
        </p>
        <div className="meta-row">
          <span className="chip">Memorized: {progressSummary.memorized}</span>
          <span className="chip">In progress: {progressSummary.inProgress}</span>
          <span className="chip">Revised: {progressSummary.revised}</span>
          <span className="chip">Weak: {progressSummary.weak}</span>
        </div>
      </section>

      <section className="panel-grid">
        <div className="card">
          <h3>Ayah progress</h3>
          <p className="muted">Update each ayah status as you memorize and revise.</p>
          <ul className="simple-list ayah-list">
            {Array.from({ length: surah.ayahCount }).map((_, index) => {
              const ayahNumber = index + 1;
              const currentStatus = progressMap.get(ayahNumber)?.status ?? "NOT_STARTED";

              return (
                <li key={ayahNumber} className="ayah-row">
                  <strong>Ayah {ayahNumber}</strong>
                  <select
                    value={currentStatus}
                    disabled={savingAyah === ayahNumber}
                    onChange={(event) => updateStatus(ayahNumber, event.target.value as AyahStatus)}
                    className="ayah-select"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
