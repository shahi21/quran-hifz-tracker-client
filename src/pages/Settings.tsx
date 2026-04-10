import { useEffect, useState } from "react";
import { api } from "../api/client";

type Profile = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

export function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    api<Profile>("/users/profile", { authenticated: true }).then(setProfile).catch(() => null);
  }, []);

  return (
    <div className="page-stack">
      <section className="page-header">
        <p className="eyebrow">Settings</p>
        <h2>Account</h2>
      </section>

      <section className="panel-grid">
        <article className="card">
          <div className="mini-chart-head">
            <h3>Your profile</h3>
            <span className="muted">Read-only</span>
          </div>
          <p className="muted">Basic account details.</p>

          <div className="form-grid stack-sm">
            <label>
              Name
              <input value={profile?.name ?? ""} readOnly />
            </label>
            <label>
              Email
              <input value={profile?.email ?? ""} readOnly />
            </label>
            <label>
              Role
              <input value={profile?.role ?? ""} readOnly />
            </label>
          </div>
        </article>
      </section>
    </div>
  );
}
