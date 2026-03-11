package com.project.controller;

import com.aicourse.model.UserPrincipal;
import com.project.dto.CreateProjectRequest;
import com.project.dto.ProjectResponse;
import com.project.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    private static final Logger LOGGER = Logger.getLogger(ProjectController.class.getName());

    @Autowired
    private ProjectService projectService;

    private Long getUserId(Authentication auth) {
        return ((UserPrincipal) auth.getPrincipal()).getUser().getId();
    }

    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody CreateProjectRequest request, Authentication auth) {
        try {
            ProjectResponse response = projectService.createProject(getUserId(auth), request, auth);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Failed to create project: {0}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create project.");
        }
    }

    @GetMapping
    public ResponseEntity<?> getMyProjects(Authentication auth) {
        try {
            List<ProjectResponse> projects = projectService.getProjectsByCreator(getUserId(auth));
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Failed to fetch projects: {0}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch projects.");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProject(@PathVariable Long id, Authentication auth) {
        try {
            ProjectResponse response = projectService.getProjectById(id, getUserId(auth));
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Failed to fetch project {0}: {1}",
                    new Object[]{id, e.getMessage()});
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch project.");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(@PathVariable Long id, @RequestBody CreateProjectRequest request, Authentication auth) {
        try {
            ProjectResponse response = projectService.updateProject(id, getUserId(auth), request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Failed to update project {0}: {1}",
                    new Object[]{id, e.getMessage()});
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update project.");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean deleteCourses,
            Authentication auth) {
        try {
            projectService.deleteProject(id, getUserId(auth), deleteCourses);
            String msg = deleteCourses
                    ? "Project and all its courses deleted."
                    : "Project deleted. Courses have been unlinked.";
            return ResponseEntity.ok(msg);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Failed to delete project {0}: {1}",
                    new Object[]{id, e.getMessage()});
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete project.");
        }
    }

    @PostMapping("/{id}/courses/{courseId}")
    public ResponseEntity<?> addCourse(@PathVariable Long id, @PathVariable Long courseId, Authentication auth) {
        try {
            projectService.addCourseToProject(id, courseId, getUserId(auth));
            return ResponseEntity.ok("Course added to project.");
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Failed to add course {0} to project {1}: {2}",
                    new Object[]{courseId, id, e.getMessage()});
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to add course to project.");
        }
    }

    @DeleteMapping("/{id}/courses/{courseId}")
    public ResponseEntity<?> removeCourse(@PathVariable Long id, @PathVariable Long courseId, Authentication auth) {
        try {
            projectService.removeCourseFromProject(id, courseId, getUserId(auth));
            return ResponseEntity.ok("Course removed from project.");
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Failed to remove course {0} from project {1}: {2}",
                    new Object[]{courseId, id, e.getMessage()});
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to remove course from project.");
        }
    }

}
