import { apiFetch } from './apiClient';

/**
 * Resolve a share token to get course details
 */
export const resolveShareToken = async (token: string) => {
  const res = await apiFetch(`/api/join/${token}`, {
    requiresAuth: false,
  });
  return res.data;
};

/**
 * Enroll in a course using a share link
 */
export const enrollUsingShareLink = async (token: string) => {
  const res = await apiFetch(`/api/join/${token}/enroll`, {
    method: 'POST',
    requiresAuth: false,
  });
  return res.data;
};

