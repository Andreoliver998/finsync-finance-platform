import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api.js";

const AuthContext = createContext(null);

const TOKEN_KEY = "finsync:token";
const USER_KEY  = "finsync:user";

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; } catch { return null; }
  });
  const [token, setToken]   = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [loading, setLoading] = useState(false);

  /* Keep axios header in sync */
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res  = await api.post("/auth/login", { email, password });
      const data = res.data?.data ?? res.data;
      const jwt  = data?.token ?? data?.accessToken ?? data?.jwt;
      const me   = data?.user ?? { email };

      if (!jwt) throw new Error("Token não retornado pelo servidor.");

      localStorage.setItem(TOKEN_KEY, jwt);
      localStorage.setItem(USER_KEY, JSON.stringify(me));
      setToken(jwt);
      setUser(me);
      return { ok: true };
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Erro ao fazer login.";
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = Boolean(token);

  const value = useMemo(
    () => ({ user, token, loading, isAuthenticated, login, logout }),
    [user, token, loading, isAuthenticated, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
