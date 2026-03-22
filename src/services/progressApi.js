import { apiFetch } from './apiClient';

export const markLessonComplete = async (lessonId, courseId) => {
    const res = await apiFetch(`/api/progress/lessons/${lessonId}/complete?courseId=${courseId}`, {
        method: "PUT"
    });
    return res.data;
};

export const markLessonIncomplete = async (lessonId, courseId) => {
    const res = await apiFetch(`/api/progress/lessons/${lessonId}/incomplete?courseId=${courseId}`, {
        method: "PUT"
    });
    return res.data;
};

export const getCourseProgress = async (courseId) => {
    const res = await apiFetch(`/api/progress/courses/${courseId}`);
    return res.data;
};

export const getMyProgress = async () => {
    const res = await apiFetch(`/api/progress/my-progress`);
    return res.data;
};

export const getEnrollment = async (courseId) => {
    const res = await apiFetch(`/api/progress/enrollments/${courseId}`);
    return res.data;
};

export const getCourseEnrollments = async (courseId) => {
    const res = await apiFetch(`/api/progress/courses/${courseId}/enrollments`);
    return res.data;
};

export const updateEnrollmentStatus = async (courseId, status) => {
    const res = await apiFetch(`/api/progress/enrollments/${courseId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status })
    });
    return res.data;
};
