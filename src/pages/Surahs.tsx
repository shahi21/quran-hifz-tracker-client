import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

type Surah = {
  id: number;
  englishName: string;
  arabicName: string;
  ayahCount: number;
  juzStart: number;
  juzEnd: number;
  revelationType: string;
};

export function SurahsPage() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api<Surah[]>("/surahs", { authenticated: true }).then(setSurahs).catch(() => null);
  }, []);

  const filteredSurahs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return surahs;

    return surahs.filter((surah) => {
      return (
        surah.englishName.toLowerCase().includes(q) ||
        surah.arabicName.toLowerCase().includes(q) ||
        surah.revelationType.toLowerCase().includes(q) ||
        String(surah.id).includes(q)
      );
    });
  }, [surahs, query]);

  return (
    <div className="page-stack">
      <section className="page-header">
        <p className="eyebrow">Surahs</p>
        <h2>All 114 surahs ready for progress tracking</h2>
      </section>
      <section className="surah-toolbar">
        <label className="surah-search" htmlFor="surah-search">
          <span className="muted">Search by surah name, number, or type</span>
          <input
            id="surah-search"
            type="search"
            placeholder="e.g. Al-Baqarah, 2, Madinan"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </section>
      <section className="surah-grid">
        {filteredSurahs.map((surah) => (
          <Link to={`/surahs/${surah.id}`} key={surah.id}>
            <article className="card" style={{ height: "100%" }}>
              <div className="surah-topline">
                <strong>{surah.id}</strong>
                <span>{surah.revelationType}</span>
              </div>
              <h3>{surah.englishName}</h3>
              <p className="arabic-name">{surah.arabicName}</p>
              <p className="muted">
                {surah.ayahCount} ayahs - Juz {surah.juzStart}
                {surah.juzEnd !== surah.juzStart ? `-${surah.juzEnd}` : ""}
              </p>
            </article>
          </Link>
        ))}
        {filteredSurahs.length === 0 ? <p className="muted">No surahs match your search.</p> : null}
      </section>
    </div>
  );
}
