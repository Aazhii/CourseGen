import { apiFetch } from './apiClient';

/**
 * Generate a share link for a course
 */
export async function generateShareLink(courseId: string, payload: any): Promise<any> {
  const res = await apiFetch(`/api/courses/${courseId}/share/generate`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

/**
 * Get all share links for a course
 */
export async function getCourseShareLinks(courseId: string): Promise<any[]> {
  const res = await apiFetch(`/api/courses/${courseId}/share/links`);
  return res.data || [];
}

/**
 * Deactivate a specific share link
 */
export async function deactivateShareLink(courseId: string, shareLinkId: string): Promise<any> {
  const res = await apiFetch(`/api/courses/${courseId}/share/links/${shareLinkId}/deactivate`, {
    method: 'PUT',
  });
  return res.data;
}

/**
 * Activate a specific share link
 */
export async function activateShareLink(courseId: string, shareLinkId: string): Promise<any> {
  const res = await apiFetch(`/api/courses/${courseId}/share/links/${shareLinkId}/activate`, {
    method: 'PUT',
  });
  return res.data;
}

/**
 * Deactivate all share links for a course
 */
export async function deactivateAllShareLinks(courseId: string): Promise<any> {
  const res = await apiFetch(`/api/courses/${courseId}/share/links/deactivate-all`, {
    method: 'PUT',
  });
  return res.data;
}

/**
 * Activate all share links for a course
 */
export async function activateAllShareLinks(courseId: string): Promise<any> {
  const res = await apiFetch(`/api/courses/${courseId}/share/links/activate-all`, {
    method: 'PUT',
  });
  return res.data;
}

/**
 * Delete (revoke) a share link
 */
export async function revokeShareLink(courseId: string, shareLinkId: string): Promise<any> {
  const res = await apiFetch(`/api/courses/${courseId}/share/links/${shareLinkId}`, {
    method: 'DELETE',
  });
  return res.data;
}

/**
 * Update a share link
 */
export async function updateShareLink(courseId: string, shareLinkId: string, payload: any): Promise<any> {
  const res = await apiFetch(`/api/courses/${courseId}/share/links/${shareLinkId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res.data;
}

/**
 * Send direct email invites for a course
 */
export async function sendDirectInvite(courseId: string, emails: string[]): Promise<any> {
  const res = await apiFetch(`/api/courses/${courseId}/share/invite`, {
    method: 'POST',
    body: JSON.stringify({ emails }),
  });
  return res.data;
}

