import { apiFetch } from './apiClient';

/**
 * Mark a lesson as complete
 */
export const markLessonComplete = async (lessonId: string, courseId: string) => {
  const res = await apiFetch(`/api/progress/lessons/${lessonId}/complete?courseId=${courseId}`, {
    method: 'PUT',
  });
  return res.data;
};

/**
 * Mark a lesson as incomplete
 */
export const markLessonIncomplete = async (lessonId: string, courseId: string) => {
  const res = await apiFetch(`/api/progress/lessons/${lessonId}/incomplete?courseId=${courseId}`, {
    method: 'PUT',
  });
  return res.data;
};

/**
 * Get progress for a specific course
 */
export const getCourseProgress = async (courseId: string) => {
  const res = await apiFetch(`/api/progress/courses/${courseId}`);
  return res.data;
};

/**
 * Get user's overall progress
 */
export const getMyProgress = async () => {
  const res = await apiFetch('/api/progress/my-progress');
  return res.data;
};

/**
 * Get enrollment for a course
 */
export const getEnrollment = async (courseId: string) => {
  const res = await apiFetch(`/api/progress/enrollments/${courseId}`);
  return res.data;
};

/**
 * Get all enrollments for a course
 */
export const getCourseEnrollments = async (courseId: string) => {
  const res = await apiFetch(`/api/progress/courses/${courseId}/enrollments`);
  return res.data;
};

/**
 * Update enrollment status
 */
export const updateEnrollmentStatus = async (courseId: string, status: string) => {
  const res = await apiFetch(`/api/progress/enrollments/${courseId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  return res.data;
};

