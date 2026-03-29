import { API_BASE_URL } from '../constants';

/**
 * Central API fetch function with proper token handling, validation, and error recovery
 * Handles Bearer token authentication across all requests
 */
export async function apiFetch(
  url: string,
  options: RequestInit & { requiresAuth?: boolean } = {}
) {
  const { requiresAuth = true, ...fetchOptions } = options;

  // Get and clean the token from localStorage
  let token = localStorage.getItem('token');

  // Aggressive token cleaning - handle all garbage cases
  if (token) {
    token = token.trim();
    // Strip JSON quotes if present
    if (token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }
    // If token is HTML garbage, null string, or undefined
    if (
      token.startsWith('<') ||
      token.includes('<!DOCTYPE') ||
      token === 'null' ||
      token === 'undefined' ||
      token === ''
    ) {
      console.warn(
        'Detected invalid token (HTML or empty), clearing storage.'
      );
      localStorage.removeItem('token');
      token = null;
    }
  }

  // Build headers with optional auth
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(requiresAuth && token && { Authorization: `Bearer ${token}` }),
    ...(fetchOptions.headers as Record<string, string>) || {},
  };

  // Construct full URL
  const baseUrl = (API_BASE_URL || '').trim();
  const fullUrl = `${baseUrl}${url}`;

  // Validate URL format
  try {
    new URL(fullUrl);
  } catch (e) {
    console.error('Invalid URL construction:', fullUrl);
    throw new Error(`Invalid URL: ${fullUrl}`);
  }

  console.log('apiFetch Details:', { fullUrl, requiresAuth, hasToken: !!token });

  try {
    const res = await fetch(fullUrl, {
      ...fetchOptions,
      headers,
    });

    // Handle non-OK responses
    if (!res.ok) {
      const err = await res.text();
      console.error(`API Error [${url}]:`, res.status, err);
      throw new Error(err || `API Error: ${res.status}`);
    }

    // Parse response based on content type
    const contentType = res.headers.get('content-type');
    console.log('apiFetch: Response Status:', res.status, 'Content-Type:', contentType);

    if (contentType && contentType.includes('application/json')) {
      const json = await res.json();
      console.log('apiFetch: Parsed JSON:', json);
      return json;
    }

    // Return text response
    const text = await res.text();

    // Check if we accidentally got HTML back (e.g., 404 page from server)
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      console.error(`API received HTML instead of data [${url}]:`, text);
      throw new Error(
        'Received HTML response from API (likely 404 or 500 error)'
      );
    }

    return text;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
}


