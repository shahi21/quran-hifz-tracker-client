const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

type RequestOptions = RequestInit & {
  authenticated?: boolean;
};

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem("hifz_access_token");
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.authenticated && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && options.authenticated) {
      const refreshToken = localStorage.getItem("hifz_refresh_token");
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const session = await refreshRes.json();
            localStorage.setItem("hifz_access_token", session.accessToken);
            if (session.refreshToken) {
              localStorage.setItem("hifz_refresh_token", session.refreshToken);
            }

            const retryHeaders = new Headers(options.headers);
            retryHeaders.set("Authorization", `Bearer ${session.accessToken}`);
            if (!retryHeaders.has("Content-Type")) {
              retryHeaders.set("Content-Type", "application/json");
            }

            const retryResponse = await fetch(`${API_URL}${path}`, {
              ...options,
              headers: retryHeaders,
            });

            if (retryResponse.ok) {
              if (retryResponse.status === 204) return undefined as T;
              return retryResponse.json();
            }
          }
        } catch (e) {
          // Fall through to original request throw
        }
      }
    }

    const error = await response.json().catch(() => ({ message: "Request failed." }));
    throw new Error(error.message ?? "Request failed.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

