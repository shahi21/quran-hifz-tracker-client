import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/surahs", label: "Surahs" },
  { to: "/sessions", label: "Sessions" },
  { to: "/revisions", label: "Revisions" },
  { to: "/goals", label: "Goals" },
  { to: "/calendar", label: "Calendar" },
  { to: "/settings", label: "Settings" },
];

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("nav-open-mobile", mobileNavOpen);
    return () => {
      document.body.classList.remove("nav-open-mobile");
    };
  }, [mobileNavOpen]);

  return (
    <div className={`app-shell ${mobileNavOpen ? "nav-open" : ""}`}>
      <header className="mobile-shell-head">
        <div>
          <p className="eyebrow">Quran Hifz Tracker</p>
          <p className="mobile-shell-subtitle">Build consistency with intention.</p>
        </div>
        <button
          type="button"
          className="ghost-button mobile-nav-toggle"
          onClick={() => setMobileNavOpen((open) => !open)}
          aria-expanded={mobileNavOpen}
          aria-controls="app-sidebar"
          aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {mobileNavOpen ? "Close" : "Menu"}
        </button>
      </header>
      <button
        type="button"
        className="mobile-nav-backdrop"
        aria-label="Close menu"
        onClick={() => setMobileNavOpen(false)}
      />
      <aside id="app-sidebar" className="sidebar">
        <div>
          <p className="eyebrow">Quran Hifz Tracker</p>
          <h1>Build consistency with intention.</h1>
        </div>
        <nav>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className="nav-link" onClick={() => setMobileNavOpen(false)}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p>{user?.name}</p>
          <button
            onClick={() => {
              setMobileNavOpen(false);
              void logout();
            }}
            className="ghost-button"
            type="button"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="content">
        <div className="content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
