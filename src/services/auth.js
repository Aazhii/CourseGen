const API_BASE = "http://localhost:8080";
// const API_BASE = "https://cd9dzv2f-8080.inc1.devtunnels.ms/";

export async function checkAuth() {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    credentials: "include"
  });
  return res.ok;
}
