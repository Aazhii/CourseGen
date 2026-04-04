/**
 * Global constants for the application
 */

// Keep empty in development to use Vite's /api proxy and avoid browser CORS issues.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").trim();

export const TOKEN_STORAGE_KEY = 'token';

