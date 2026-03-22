package com.sharing.controller;

import com.aicourse.model.UserPrincipal;
import com.aicourse.utils.api.ApiResponse;
import com.sharing.dto.CourseProgressResponse;
import com.sharing.dto.EnrollmentResponse;
import com.sharing.model.EnrollmentStatus;
import com.sharing.service.LessonProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/progress")
public class LessonProgressController {

    private static final Logger LOGGER = Logger.getLogger(LessonProgressController.class.getName());

    @Autowired
    private LessonProgressService lessonProgressService;

    /**
     * Mark a lesson as complete
     */
    @PutMapping("/lessons/{lessonId}/complete")
    public ResponseEntity<ApiResponse<Void>> markLessonComplete(
            @PathVariable Long lessonId,
            @RequestParam Long courseId,
            Authentication auth) {

        LOGGER.log(Level.INFO, "Request received to mark lesson {0} complete", lessonId);
        try {
            UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
            lessonProgressService.markLessonComplete(lessonId, courseId, principal.getUser().getId());

            LOGGER.log(Level.INFO, "Lesson marked as complete successfully");
            return ResponseEntity.ok(ApiResponse.success("Lesson marked as complete", null));
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error marking lesson complete: {0}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.failure("Error marking lesson complete: " + e.getMessage()));
        }
    }

    /**
     * Mark a lesson as incomplete
     */
    @PutMapping("/lessons/{lessonId}/incomplete")
    public ResponseEntity<ApiResponse<Void>> markLessonIncomplete(
            @PathVariable Long lessonId,
            @RequestParam Long courseId,
            Authentication auth) {

        LOGGER.log(Level.INFO, "Request received to mark lesson {0} incomplete", lessonId);
        try {
            UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
            lessonProgressService.markLessonIncomplete(lessonId, courseId, principal.getUser().getId());

            LOGGER.log(Level.INFO, "Lesson marked as incomplete successfully");
            return ResponseEntity.ok(ApiResponse.success("Lesson marked as incomplete", null));
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error marking lesson incomplete: {0}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.failure("Error marking lesson incomplete: " + e.getMessage()));
        }
    }

    /**
     * Get user's progress in a specific course
     */
    @GetMapping("/courses/{courseId}")
    public ResponseEntity<ApiResponse<CourseProgressResponse>> getCourseProgress(
            @PathVariable Long courseId,
            Authentication auth) {

        LOGGER.log(Level.INFO, "Request received to fetch progress for course: {0}", courseId);
        try {
            UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
            CourseProgressResponse response = lessonProgressService.getUserCourseProgress(courseId, principal.getUser().getId());

            LOGGER.log(Level.INFO, "Course progress fetched successfully");
            return ResponseEntity.ok(ApiResponse.success("Course progress fetched successfully", response));
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching course progress: {0}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.failure("Error fetching course progress: " + e.getMessage()));
        }
    }

    /**
     * Get all user's course progress
     */
    @GetMapping("/my-progress")
    public ResponseEntity<ApiResponse<List<CourseProgressResponse>>> getUserAllProgress(
            Authentication auth) {

        LOGGER.log(Level.INFO, "Request received to fetch all user progress");
        try {
            UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
            List<CourseProgressResponse> response = lessonProgressService.getUserAllProgress(principal.getUser().getId());

            LOGGER.log(Level.INFO, "All user progress fetched successfully");
            return ResponseEntity.ok(ApiResponse.success("All user progress fetched successfully", response));
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching user progress: {0}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.failure("Error fetching user progress: " + e.getMessage()));
        }
    }

    /**
     * Get user's enrollment in a course
     */
    @GetMapping("/enrollments/{courseId}")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> getEnrollment(
            @PathVariable Long courseId,
            Authentication auth) {

        LOGGER.log(Level.INFO, "Request received to fetch enrollment for course: {0}", courseId);
        try {
            UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
            EnrollmentResponse response = lessonProgressService.getEnrollment(courseId, principal.getUser().getId());

            LOGGER.log(Level.INFO, "Enrollment fetched successfully");
            return ResponseEntity.ok(ApiResponse.success("Enrollment fetched successfully", response));
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching enrollment: {0}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.failure("Error fetching enrollment: " + e.getMessage()));
        }
    }

    /**
     * Get all enrollments for a course (admin/creator only)
     */
    @GetMapping("/courses/{courseId}/enrollments")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getCourseEnrollments(
            @PathVariable Long courseId) {

        LOGGER.log(Level.INFO, "Request received to fetch enrollments for course: {0}", courseId);
        try {
            List<EnrollmentResponse> response = lessonProgressService.getCourseEnrollments(courseId);

            LOGGER.log(Level.INFO, "Course enrollments fetched successfully");
            return ResponseEntity.ok(ApiResponse.success("Course enrollments fetched successfully", response));
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching course enrollments: {0}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.failure("Error fetching course enrollments: " + e.getMessage()));
        }
    }

    /**
     * Update enrollment status
     */
    @PutMapping("/enrollments/{courseId}/status")
    public ResponseEntity<ApiResponse<Void>> updateEnrollmentStatus(
            @PathVariable Long courseId,
            @RequestBody Map<String, String> payload,
            Authentication auth) {

        LOGGER.log(Level.INFO, "Request received to update enrollment status for course: {0}", courseId);
        try {
            UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
            String statusStr = payload.get("status");
            EnrollmentStatus status = EnrollmentStatus.valueOf(statusStr);

            lessonProgressService.updateEnrollmentStatus(courseId, principal.getUser().getId(), status);

            LOGGER.log(Level.INFO, "Enrollment status updated successfully");
            return ResponseEntity.ok(ApiResponse.success("Enrollment status updated successfully", null));
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error updating enrollment status: {0}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.failure("Error updating enrollment status: " + e.getMessage()));
        }
    }
}



