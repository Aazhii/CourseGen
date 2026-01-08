import { apiFetch } from "./apiClient";

export async function createCourse(data) {
    return apiFetch("/api/courses/generate", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function fetchCourses() {
    return apiFetch("/api/courses");
}

export async function getCourseById(id) {
    return apiFetch(`/api/courses/${id}`);
}

export async function updateCourse(id, data) {
    return apiFetch(`/api/courses/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}