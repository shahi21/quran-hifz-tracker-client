import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../api/client";

type User = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

type SessionResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

function persistTokens(accessToken: string | null, refreshToken?: string | null) {
  if (accessToken) {
    localStorage.setItem("hifz_access_token", accessToken);
  } else {
    localStorage.removeItem("hifz_access_token");
  }

  if (refreshToken !== undefined) {
    if (refreshToken) {
      localStorage.setItem("hifz_refresh_token", refreshToken);
    } else {
      localStorage.removeItem("hifz_refresh_token");
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("hifz_access_token");

    if (!token) {
      setLoading(false);
      return;
    }

    api<User>("/auth/me", { authenticated: true })
      .then(setUser)
      .catch(() => persistTokens(null, null))
      .finally(() => setLoading(false));
  }, []);

  async function handleAuth(path: string, body: Record<string, string>) {
    const response = await api<SessionResponse>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });

    persistTokens(response.accessToken, response.refreshToken);
    setUser(response.user);
  }

  async function login(email: string, password: string) {
    await handleAuth("/auth/login", { email, password });
  }

  async function register(name: string, email: string, password: string) {
    await handleAuth("/auth/register", { name, email, password });
  }

  async function logout() {
    const refreshToken = localStorage.getItem("hifz_refresh_token");
    await api("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }).catch(() => undefined);

    persistTokens(null, null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

