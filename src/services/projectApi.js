import { apiFetch } from "./apiClient";

export async function createProject(payload) {
    return apiFetch("/api/projects", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}

export async function getMyProjects() {
    return apiFetch("/api/projects");
}

export async function getProjectById(projectId) {
    return apiFetch(`/api/projects/${projectId}`);
}

export async function updateProject(projectId, payload) {
    return apiFetch(`/api/projects/${projectId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
    });
}

export async function deleteProject(projectId, deleteCourses = false) {
    return apiFetch(`/api/projects/${projectId}?deleteCourses=${deleteCourses}`, {
        method: "DELETE"
    });
}

export async function addCourseToProject(projectId, courseId) {
    return apiFetch(`/api/projects/${projectId}/courses/${courseId}`, {
        method: "POST"
    });
}

export async function removeCourseFromProject(projectId, courseId) {
    return apiFetch(`/api/projects/${projectId}/courses/${courseId}`, {
        method: "DELETE"
    });
}
