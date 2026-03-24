import { apiFetch } from './apiClient';

export const resolveShareToken = async (token) => {
    const res = await apiFetch(`/api/join/${token}`);
    return res.data;
};

export const enrollUsingShareLink = async (token) => {
    const res = await apiFetch(`/api/join/${token}/enroll`, {
        method: "POST"
    });
    return res.data;
};
