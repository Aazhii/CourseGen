package com.project.service;

import com.project.dto.CreateProjectRequest;
import com.project.dto.ProjectResponse;

import java.util.List;

public interface ProjectService {

    ProjectResponse createProject(Long userId, CreateProjectRequest request) throws Exception;

    List<ProjectResponse> getProjectsByCreator(Long userId) throws Exception;

    ProjectResponse getProjectById(Long projectId, Long userId) throws Exception;

    ProjectResponse updateProject(Long projectId, Long userId, CreateProjectRequest request) throws Exception;

    /**
     * @param deleteCourses true  → hard-delete all courses inside the project
     *                      false → unlink courses (project_id = null), then delete project
     */
    void deleteProject(Long projectId, Long userId, boolean deleteCourses) throws Exception;

    void addCourseToProject(Long projectId, Long courseId, Long userId) throws Exception;

    void removeCourseFromProject(Long projectId, Long courseId, Long userId) throws Exception;
}