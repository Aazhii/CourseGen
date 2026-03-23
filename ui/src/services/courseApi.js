import { apiFetch } from "./apiClient";

export async function createCourse(data) {
    return apiFetch("/api/courses/create", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function fetchCourses() {
    return apiFetch("/api/courses/my-courses");
}

export async function fetchCoursesSharedByMe() {
    return apiFetch("/api/courses/shared-by-me");
}

export async function getCourseById(id) {
    return apiFetch(`/api/courses/${id}`);
}
export async function updateCourse(id, data) {
    return apiFetch(`/api/courses/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
    });
}

export async function deleteCourse(id) {
    return apiFetch(`/api/courses/${id}`, {
        method: "DELETE",
    });
}

export async function activateCourse(id) {
    return apiFetch(`/api/courses/${id}/activate`, {
        method: "PUT",
    });
}

export async function deactivateCourse(id) {
    return apiFetch(`/api/courses/${id}/deactivate`, {
        method: "PUT",
    });
}

// --- New Lesson Endpoints ---

export async function generateLessonContent(courseId, moduleId, lessonId) {
    return apiFetch(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/generate`, {
        method: "POST",
    });
}

export async function getLessonById(id) {
    return apiFetch(`/api/courses/lessons/${id}`);
}