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
    console.warn("AuthContext: LOGOUT TRIGGERED!"); // Trace who calls this
    await apiLogout(); // Call backend
    localStorage.removeItem("token");
    setToken(null);
  };

  useEffect(() => {
    // Check for token in URL (OAuth redirect)
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    if (urlToken) {
      login(urlToken);
      // Remove token from URL for cleaner history
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        console.log("AuthContext: Fetching user with token", token);
        const res = await getMe();
        console.log("AuthContext: User fetched", res);
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