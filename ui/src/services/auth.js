const API_BASE = "http://localhost:8080";

export async function checkAuth() {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    credentials: "include"
  });
  return res.ok;
}
