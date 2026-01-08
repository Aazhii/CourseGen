import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiFetch } from "../api/apiClient";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;
    apiFetch("/api/auth/me")
      .then(() => {
        if (!mounted) return;
        setAuthenticated(true);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setAuthenticated(false);
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Checking authentication...</div>;

  return authenticated ? children : <Navigate to="/login" replace />;
}
