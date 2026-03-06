import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { apiFetch } from "../services/apiClient";

export default function ProtectedRoute({ children }) {
  const { token, user, loading } = useAuth();

  // If no token at all
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Waiting for AuthContext to fetch the user object
  if (loading) return <div>Checking authentication...</div>;

  // If token is invalid/expired, `user` will be null after loading finishes
  return user ? children : <Navigate to="/login" replace />;
}
