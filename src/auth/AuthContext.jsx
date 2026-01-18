import { createContext, useContext, useState } from "react";
import { logout as apiLogout } from "../services/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));

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

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
