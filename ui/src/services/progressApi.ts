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

/**
 * Start a lesson session
 */
export const startLessonSession = async (lessonId: string, courseId: string) => {
  const res = await apiFetch(`/api/progress/lessons/${lessonId}/session/start?courseId=${courseId}`, {
    method: 'POST',
  });
  return res.data;
};

/**
 * Stop a lesson session
 */
export const stopLessonSession = async (lessonId: string, courseId: string) => {
  const res = await apiFetch(`/api/progress/lessons/${lessonId}/session/stop?courseId=${courseId}`, {
    method: 'POST',
  });
  return res.data;
};

/**
 * Record a quiz attempt
 */
export const recordQuizAttempt = async (lessonId: string, courseId: string, quizIndex: number, correct: boolean) => {
  const res = await apiFetch(`/api/progress/lessons/${lessonId}/quiz-attempts?courseId=${courseId}`, {
    method: 'POST',
    body: JSON.stringify({ quizIndex, correct }),
  });
  return res.data;
};

/**
 * Get shared course usage report for an enrolled user (Creator only)
 */
export const getSharedCourseUsage = async (courseId: string, userId: string) => {
  const res = await apiFetch(`/api/progress/courses/${courseId}/users/${userId}/report`);
  return res.data;
};

/**
 * Get course leaderboard (all enrolled users ranked by composite score)
 */
export const getCourseLeaderboard = async (courseId: string) => {
  const res = await apiFetch(`/api/progress/courses/${courseId}/leaderboard`);
  return res.data as Array<{
    userId: number;
    username: string;
    rank: number;
    score: number;
    totalProgress: number;
    lessonsCompleted: number;
    quizAccuracy: number;
    totalTimeSeconds: number;
    flaggedCount: number;
  }>;
};
