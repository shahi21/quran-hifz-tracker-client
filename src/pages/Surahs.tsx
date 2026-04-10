import { useEffect, useState } from "react";
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

  useEffect(() => {
    api<Surah[]>("/surahs", { authenticated: true }).then(setSurahs).catch(() => null);
  }, []);

  return (
    <div className="page-stack">
      <section className="page-header">
        <p className="eyebrow">Surahs</p>
        <h2>All 114 surahs ready for progress tracking</h2>
      </section>
      <section className="surah-grid">
        {surahs.map((surah) => (
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
      </section>
    </div>
  );
}

