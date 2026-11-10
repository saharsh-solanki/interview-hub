import { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleForceLogout = useCallback(() => {
    setUser(null);
  }, []);

  useEffect(() => {
    window.addEventListener("auth:logout", handleForceLogout);
    return () => window.removeEventListener("auth:logout", handleForceLogout);
  }, [handleForceLogout]);

  useEffect(() => {
    if (api.hasToken()) {
      api
        .getMe()
        .then((u) => setUser(u))
        .catch(() => {
          api.logout();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(username, password) {
    try {
      const u = await api.login(username, password);
      setUser(u);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  function logout() {
    api.logout();
    setUser(null);
  }

  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "admin" || user?.role === "sales";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-pulse text-ink-muted text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isStaff }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
