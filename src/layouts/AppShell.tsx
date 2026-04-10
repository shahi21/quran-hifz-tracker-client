import { NavLink, Outlet } from "react-router-dom";
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
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Quran Hifz Tracker</p>
          <h1>Build consistency with intention.</h1>
        </div>
        <nav>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className="nav-link">
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p>{user?.name}</p>
          <button onClick={() => void logout()} className="ghost-button" type="button">
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
