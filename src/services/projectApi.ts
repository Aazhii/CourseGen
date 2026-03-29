import { apiFetch } from './apiClient';

export interface Project {
  id: string;
  name: string;
  description?: string;
  courses?: any[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface ProjectCreatePayload {
  name: string;
  description?: string;
}

/**
 * Create a new project
 */
export async function createProject(payload: ProjectCreatePayload): Promise<Project> {
  const res = await apiFetch('/api/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data;
}

/**
 * Get all projects for the current user
 */
export async function getMyProjects(): Promise<Project[]> {
  const res = await apiFetch('/api/projects');
  return res.data || [];
}

/**
 * Get a specific project by ID
 */
export async function getProjectById(projectId: string): Promise<Project> {
  const res = await apiFetch(`/api/projects/${projectId}`);
  return res.data;
}

/**
 * Update a project
 */
export async function updateProject(projectId: string, payload: Partial<ProjectCreatePayload>): Promise<Project> {
  const res = await apiFetch(`/api/projects/${projectId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res.data;
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string, deleteCourses = false): Promise<any> {
  const res = await apiFetch(`/api/projects/${projectId}?deleteCourses=${deleteCourses}`, {
    method: 'DELETE',
  });
  return res.data;
}

/**
 * Add a course to a project
 */
export async function addCourseToProject(projectId: string, courseId: string): Promise<Project> {
  const res = await apiFetch(`/api/projects/${projectId}/courses/${courseId}`, {
    method: 'POST',
  });
  return res.data;
}

/**
 * Remove a course from a project
 */
export async function removeCourseFromProject(projectId: string, courseId: string): Promise<Project> {
  const res = await apiFetch(`/api/projects/${projectId}/courses/${courseId}`, {
    method: 'DELETE',
  });
  return res.data;
}

