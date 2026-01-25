import { API_BASE_URL } from "../constants";

export async function apiFetch(url, options = {}) {
  const { requiresAuth = true, ...fetchOptions } = options;

  let token = localStorage.getItem("token");

  // Aggressive token cleaning
  if (token) {
    token = token.trim();
    if (token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }
    // If token is HTML garbage or invalid
    if (
      token.startsWith("<") ||
      token.includes("<!DOCTYPE") ||
      token === "null" ||
      token === "undefined" ||
      token === ""
    ) {
      console.warn("Detected invalid token (HTML or empty), clearing storage.");
      localStorage.removeItem("token");
      token = null;
    }
  }

  const headers = {
    "Content-Type": "application/json",
    ...(requiresAuth && token && { Authorization: `Bearer ${token}` }),
    ...(fetchOptions.headers || {}),
  };

  const baseUrl = (API_BASE_URL || "").trim();
  const fullUrl = `${baseUrl}${url}`;

  try {
    new URL(fullUrl);
  } catch (e) {
    console.error("Invalid URL construction:", fullUrl);
    throw new Error(`Invalid URL: ${fullUrl}`);
  }

  console.log("apiFetch Details:", { fullUrl, requiresAuth, hasToken: !!token });
  // console.log("apiFetch Headers:", headers); // Uncomment for debugging

  const res = await fetch(fullUrl, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`API Error [${url}]:`, res.status, err);
    throw new Error(err || `API Error: ${res.status}`);
  }

  const contentType = res.headers.get("content-type");
  console.log("apiFetch: Response Status:", res.status, "Content-Type:", contentType);
  if (contentType && contentType.includes("application/json")) {
    const json = await res.json();
    console.log("apiFetch: Parsed JSON:", json);
    return json;
  }

  const text = await res.text();
  // Check if we accidentally got HTML back (e.g. 404 page)
  if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
    console.error(`API received HTML instead of data [${url}]:`, text);
    throw new Error("Received HTML response from API (likely 404 or 500 error)");
  }
  return text;
}
