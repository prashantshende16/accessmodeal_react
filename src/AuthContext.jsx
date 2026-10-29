import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, getToken, setToken, clearToken } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setOrganizations([]);
    setCurrentOrg(null);
  }, []);

  const fetchSession = useCallback(async () => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.get("/auth/me");
      setUser(data.user);
      setOrganizations(data.organizations || []);
      if (data.organizations && data.organizations.length > 0) {
        setCurrentOrg((prev) => prev || data.organizations[0]);
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const login = async (email, password) => {
    const data = await api.post("/auth/login", { email, password });
    setToken(data.access_token);
    setUser(data.user);
    await fetchSession();
    return data.user;
  };

  const register = async (name, email, password) => {
    const data = await api.post("/auth/register", { name, email, password });
    setToken(data.access_token);
    setUser(data.user);
    await fetchSession();
    return data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organizations,
        currentOrg,
        setCurrentOrg,
        loading,
        login,
        register,
        logout,
        refreshSession: fetchSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
