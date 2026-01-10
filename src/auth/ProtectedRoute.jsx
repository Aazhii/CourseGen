import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { apiFetch } from "../api/apiClient";

export default function ProtectedRoute({ children }) {
  const { token } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let mounted = true;
    apiFetch("/api/auth/me")
      .then(() => {
        if (mounted) {
          setIsVerified(true);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setIsVerified(false);
          setLoading(false);
        }
      });

    return () => { mounted = false; };
  }, [token]);

  // If no token, or verification failed (and finished loading)
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Optional: You might want to allow rendering while verifying (optimistic)
  // or wait until verified (pessimistic). The original code was pessimistic.
  if (loading) return <div>Checking authentication...</div>;

  return isVerified ? children : <Navigate to="/login" replace />;
}
