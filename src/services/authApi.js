import { apiFetch } from "./apiClient";

// API_BASE is handled inside apiFetch via constants
// const API_BASE = import.meta.env.VITE_API_URL ?? "";

export async function login(credentials) {
  // apiFetch returns text if content-type is not json, which matches our backend's JWT string response
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
    requiresAuth: false,
  });
}

export async function register(data) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
    requiresAuth: false,
  });
}

export async function getMe() {
  // use apiFetch so Authorization header from apiClient is used
  return apiFetch("/api/auth/me").then(async (r) => {
    if (!r.ok) {
      const text = await r.text();
      throw new Error(text || "Not authenticated");
    }
    return r.json();
  });
}

export async function logout() {
  try {
    await apiFetch("/api/auth/logout", {
      method: "POST",
      requiresAuth: true,
    });
  } catch (err) {
    console.warn("Logout endpoint failed or not implemented", err);
  }
}

