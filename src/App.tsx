import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { AppShell } from "./layouts/AppShell";
import { CalendarPage } from "./pages/Calendar";
import { DashboardPage } from "./pages/Dashboard";
import { GoalsPage } from "./pages/Goals";
import { HomePage } from "./pages/Home";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { RevisionsPage } from "./pages/Revisions";
import { SettingsPage } from "./pages/Settings";
import { SessionsPage } from "./pages/Sessions";
import { SurahsPage } from "./pages/Surahs";
import { SurahDetailsPage } from "./pages/SurahDetails";

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="screen-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppShell />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoutes />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/surahs" element={<SurahsPage />} />
        <Route path="/surahs/:id" element={<SurahDetailsPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/revisions" element={<RevisionsPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
