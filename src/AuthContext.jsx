import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, getToken, setToken, clearToken } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(!!getToken());

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setPermissions({});
  }, []);

  // Restore session on refresh
  useEffect(() => {
    if (!getToken()) return;
    api
      .get("/auth/me")
      .then((d) => {
        setUser(d.user);
        setPermissions(d.permissions);
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  const login = async (email, password) => {
    const d = await api.post("/auth/login", { email, password });
    setToken(d.token);
    setUser(d.user);
    setPermissions(d.permissions);
    return d.user;
  };

  // can("products", "edit")
  const can = (page, action = "view") => !!permissions?.[page]?.[action];

  return (
    <AuthContext.Provider value={{ user, permissions, loading, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
