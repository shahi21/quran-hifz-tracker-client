import { Link } from "react-router-dom";
import styles from "./Home.module.css";

export function HomePage() {
  return (
    <div className={`hero-page ${styles.home}`}>
      <section className={styles.hero} aria-label="Quran Hifz Tracker introduction">
        <div className={styles.left}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            Structured Hifz Progress
          </p>

          <h1 className={styles.title}>
            Track <span className={styles.em}>memorization</span>, revision, goals, and streaks{" "}
            <span className={styles.soft}>in one calm workflow.</span>
          </h1>

          <p className={styles.copy}>
            A focused Quran hifz companion for students, parents, and teachers who want clear accountability and a
            routine that lasts.
          </p>

          <div className={styles.actions}>
            <Link to="/register" className={styles.primary}>
              Create account
            </Link>
            <Link to="/login" className={styles.secondary}>
              Sign in
            </Link>
          </div>

          <div className={styles.trust} aria-label="Key features">
            <div className={styles.trustItem}>
              <span className={styles.trustK}>Ayah-level</span>
              <span className={styles.trustV}>statuses and notes</span>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustK}>Revision</span>
              <span className={styles.trustV}>keep what you memorized</span>
            </div>
            <div className={styles.trustItem}>
              <span className={styles.trustK}>Goals</span>
              <span className={styles.trustV}>daily and weekly targets</span>
            </div>
          </div>
        </div>

        <div className={styles.right} aria-hidden="true">
          <div className={styles.previewFrame}>
            <div className={styles.previewTop}>
              <div className={styles.previewTitle}>
                <p className={styles.previewCap}>Today</p>
                <p className={styles.previewHeadline}>A clear plan</p>
              </div>
              <div className={styles.pill}>Streak 6</div>
            </div>

            <div className={styles.previewGrid}>
              <div className={styles.miniCard}>
                <p className={styles.miniK}>Hifz</p>
                <p className={styles.miniV}>2 ayahs</p>
                <div className={styles.meter}>
                  <div className={styles.meterFill} style={{ width: "66%" }} />
                </div>
              </div>
              <div className={styles.miniCard}>
                <p className={styles.miniK}>Revision</p>
                <p className={styles.miniV}>12 mins</p>
                <div className={styles.meter}>
                  <div className={styles.meterFillAlt} style={{ width: "45%" }} />
                </div>
              </div>
            </div>

            <div className={styles.checklist}>
              <div className={styles.checkItem}>
                <span className={styles.checkDot} />
                <span>Review yesterday&apos;s page</span>
              </div>
              <div className={styles.checkItem}>
                <span className={styles.checkDot} />
                <span>Memorize 2 new ayahs</span>
              </div>
              <div className={styles.checkItem}>
                <span className={styles.checkDot} />
                <span>Quick self-check notes</span>
              </div>
            </div>

            <div className={styles.previewFoot}>
              <div className={styles.ring} />
              <div className={styles.previewFootCopy}>
                <p className={styles.previewFootK}>Weekly momentum</p>
                <p className={styles.previewFootV}>Small steps, visible progress.</p>
              </div>
            </div>
          </div>

          <div className={styles.floatCard}>
            <p className={styles.floatK}>Surah progress</p>
            <p className={styles.floatV}>Tap an ayah, set a status, move on.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

