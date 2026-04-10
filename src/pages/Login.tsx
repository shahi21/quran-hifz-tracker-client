import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTilt } from "../hooks/useTilt";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const tilt = useTilt<HTMLFormElement>({ maxTiltDeg: 7, maxLiftPx: 10 });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Login failed.");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-shell auth-shell--editorial page-stack">
        <aside className="auth-aside auth-aside--cover" aria-label="Quran Hifz Tracker overview">
          <div className="auth-aside-inner">
            <div className="auth-cover">
              <div className="auth-mark">
                <div className="auth-logo" aria-hidden="true">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M16 2.5c7.46 0 13.5 6.04 13.5 13.5S23.46 29.5 16 29.5 2.5 23.46 2.5 16 8.54 2.5 16 2.5Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      opacity="0.75"
                    />
                    <path
                      d="M10.2 18.8c1.7 2 3.9 3.1 6.4 3.1 4.2 0 7.2-2.8 7.2-6.8 0-2.9-1.7-5.1-4.4-5.1-1.7 0-4.4 1.7-6.3 5.7"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.3 22.9c2.4 2.1 5.2 3.1 8.4 3.1 6.4 0 11.3-4.4 11.3-10.4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      opacity="0.85"
                    />
                  </svg>
                </div>
                <div>
                  <p className="auth-product">Quran Hifz Tracker</p>
                  <p className="auth-tagline">Memorize with clarity. Revise with discipline.</p>
                </div>
              </div>

              <div className="auth-cover-title">
                <p className="auth-cap">Daily practice, beautifully tracked</p>
                <h2>Consistency, without noise.</h2>
              </div>

              <div className="auth-divider" aria-hidden="true">
                <svg width="100%" height="14" viewBox="0 0 600 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4 7c56 0 76-4 110-4 52 0 66 8 108 8 46 0 58-8 110-8 40 0 58 8 106 8 44 0 62-8 110-8"
                    stroke="rgba(15,95,80,0.35)"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <circle cx="300" cy="7" r="3.2" fill="rgba(217,178,111,0.85)" />
                </svg>
              </div>

              <div className="auth-proof" aria-label="Product highlights">
                <div className="auth-proof-item">
                  <p className="auth-proof-k">Ayah-level</p>
                  <p className="auth-proof-v">Statuses, notes, confidence</p>
                </div>
                <div className="auth-proof-item">
                  <p className="auth-proof-k">Revision-first</p>
                  <p className="auth-proof-v">Protect what you memorized</p>
                </div>
                <div className="auth-proof-item">
                  <p className="auth-proof-k">Momentum</p>
                  <p className="auth-proof-v">Streaks, goals, weekly overview</p>
                </div>
              </div>
            </div>

            <div className="auth-aside-bottom">
              <p className="auth-aside-foot">A quiet space for daily practice and long-term progress.</p>
              <p className="auth-credit">A humble little build by Shahistha Navab</p>
            </div>
          </div>
        </aside>

        <div className="tilt-scene">
          <form
            ref={tilt.ref}
            {...tilt.handlers}
            className="auth-card auth-card--form tilt-surface auth-form"
            onSubmit={handleSubmit}
          >
            <div className="tilt-overlay" aria-hidden="true" />
            <header className="auth-head tilt-pop">
              <p className="auth-kicker">Welcome back</p>
              <h1 className="auth-title">Sign in</h1>
              <p className="auth-subtitle">Track today&apos;s work in less than a minute.</p>
            </header>

            <div className="auth-fields tilt-pop2">
              <label className="field">
                <span>Email</span>
                <div className="input3d">
                  <span className="input3d-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M4.5 7.5 12 13l7.5-5.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5.5 6.5h13A2 2 0 0 1 20.5 8.5v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                        opacity="0.9"
                      />
                    </svg>
                  </span>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </label>

              <label className="field">
                <span>Password</span>
                <div className="input3d">
                  <span className="input3d-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M7.5 11V8.9A4.5 4.5 0 0 1 12 4.5 4.5 4.5 0 0 1 16.5 8.9V11"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M6.5 11.2h11a2 2 0 0 1 2 2v5.3a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-5.3a2 2 0 0 1 2-2Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        opacity="0.9"
                      />
                      <path
                        d="M12 15.2v2.4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        opacity="0.9"
                      />
                    </svg>
                  </span>
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    autoComplete="current-password"
                    placeholder="Your password"
                    required
                  />
                </div>
              </label>
            </div>

            {error ? <p className="error-text tilt-pop2 auth-error">{error}</p> : null}

            <button className="primary-button auth-submit auth-submit--sheen tilt-pop" type="submit">
              Sign in
            </button>

            <p className="muted auth-foot tilt-pop2">
              Need an account?{" "}
              <Link to="/register" className="inline-link">
                Register
              </Link>
            </p>
            <p className="auth-credit auth-credit-mobile tilt-pop2">A humble build by Shahistha Navab</p>
          </form>
        </div>
      </div>
    </div>
  );
}
