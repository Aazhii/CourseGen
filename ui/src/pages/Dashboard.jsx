import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
  const { logout } = useAuth();

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p>You are authenticated with JWT ✅</p>
      <button className="submit-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
