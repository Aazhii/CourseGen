import { createContext, useContext, useState, useEffect } from "react";
import { logout as apiLogout, getMe } from "../services/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (jwt) => {
    // If backend returns a raw string with quotes, strip them
    if (typeof jwt === "string" && jwt.startsWith('"') && jwt.endsWith('"')) {
      jwt = jwt.slice(1, -1);
    }
    localStorage.setItem("token", jwt);
    setToken(jwt);
  };

  const logout = async () => {
    await apiLogout(); // Call backend
    localStorage.removeItem("token");
    setToken(null);
  };

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await getMe();
        setUser(res.data || res);
      } catch (err) {
        console.error("Failed to fetch user", err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, login, logout, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);