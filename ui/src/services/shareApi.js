import { apiFetch } from './apiClient';

export const generateShareLink = async (courseId, payload) => {
    const res = await apiFetch(`/api/courses/${courseId}/share/generate`, {
        method: "POST",
        body: JSON.stringify(payload)
    });
    return res.data;
};

export const getCourseShareLinks = async (courseId) => {
    const res = await apiFetch(`/api/courses/${courseId}/share/links`);
    return res.data;
};

export const deactivateShareLink = async (courseId, shareLinkId) => {
    const res = await apiFetch(`/api/courses/${courseId}/share/links/${shareLinkId}/deactivate`, {
        method: "PUT"
    });
    return res.data;
};

export const revokeShareLink = async (courseId, shareLinkId) => {
    const res = await apiFetch(`/api/courses/${courseId}/share/links/${shareLinkId}`, {
        method: "DELETE"
    });
    return res.data;
};

export const updateShareLink = async (courseId, shareLinkId, payload) => {
    const res = await apiFetch(`/api/courses/${courseId}/share/links/${shareLinkId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
    });
    return res.data;
};

export const sendDirectInvite = async (courseId, emails) => {
    const res = await apiFetch(`/api/courses/${courseId}/share/invite`, {
        method: "POST",
        body: JSON.stringify({ emails })
    });
    return res.data;
};
