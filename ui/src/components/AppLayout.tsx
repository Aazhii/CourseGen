import { Navigate, Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { useAuth } from "@/auth/AuthContext";

export default function AppLayout() {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-sm text-muted-foreground">Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background transition-colors duration-300">
      <AppSidebar />
      <main className="ml-64 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
