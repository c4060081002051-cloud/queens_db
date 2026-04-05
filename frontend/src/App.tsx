import { useCallback, useEffect, useState } from "react";
import { LoginPage } from "./LoginPage";
import { Dashboard } from "./Dashboard";
import "./App.css";

const REMEMBER_KEY = "junior_school_remembered_email";

type MeResponse = { user: { sub: string; role: string; email: string } };

async function readJsonBody<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export default function App() {
  const [email, setEmail] = useState(
    () => localStorage.getItem(REMEMBER_KEY) ?? "admin@gmail.com",
  );
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshProfile = useCallback(async () => {
    const t = localStorage.getItem("token");
    if (!t) {
      setProfile(null);
      return;
    }
    setProfileLoading(true);
    setProfileError(null);
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await readJsonBody<MeResponse & { error?: string }>(res);
      if (data === null) {
        setProfile(null);
        setProfileError("Invalid response from server. Is the API running?");
        return;
      }
      if (!res.ok) {
        setProfile(null);
        setProfileError(data.error ?? "Could not load profile");
        return;
      }
      setProfile(data);
    } catch {
      setProfile(null);
      setProfileError(
        "Cannot reach the API. Start the backend (npm run dev in backend).",
      );
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      void refreshProfile();
    } else {
      setProfile(null);
      setProfileError(null);
    }
  }, [token, refreshProfile]);

  const login = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await readJsonBody<{ token?: string; error?: string }>(res);
      if (data === null) {
        setError(
          "The app did not get JSON from the server. Start the frontend with `npm run dev` in the frontend folder and open http://localhost:5173 (do not open dist/index.html directly).",
        );
        return;
      }
      if (!res.ok) {
        if (res.status === 503 && data.error === "Database unavailable") {
          setError(
            "Database unavailable — start MySQL in XAMPP, create database queensdb, and run backend/db/schema.sql in phpMyAdmin.",
          );
          return;
        }
        setError(data.error ?? "Login failed");
        return;
      }
      if (!data.token) {
        setError("No token returned");
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem(REMEMBER_KEY, email.trim());
      setToken(data.token);
    } catch {
      setError(
        "Cannot reach the API. In a terminal run: cd backend → npm run dev (listen on port 4000). In another terminal: cd frontend → npm run dev, then use http://localhost:5173",
      );
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setProfile(null);
    setProfileError(null);
    setError(null);
  }, []);

  if (!token) {
    return (
      <LoginPage
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        onLogin={login}
        loading={loading}
        error={error}
      />
    );
  }

  return (
    <Dashboard
      user={profile?.user ?? null}
      profileLoading={profileLoading}
      profileError={profileError}
      onRetryProfile={refreshProfile}
      onLogout={logout}
    />
  );
}
