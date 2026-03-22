package com.aicourse.controller;

import com.aicourse.model.Course;
import com.aicourse.model.Module;
import com.aicourse.model.UserPrincipal;
import com.aicourse.service.courses.impl.CourseServiceImpl;
import com.aicourse.utils.api.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private static final Logger LOGGER = Logger.getLogger(CourseController.class.getName());

    @Autowired
    private CourseServiceImpl courseServiceImpl;

    @PostMapping("/create")
    public Course createCourse(@RequestBody Map<String, String> payload, Authentication auth) throws Exception {
        LOGGER.log(Level.INFO, "Request received to generate course: {0}", new Object[]{payload.get("title")});
        try {
            Course course = courseServiceImpl.generateCourse(payload, auth);
            LOGGER.log(Level.INFO, "Course generated successfully with ID: {0}", new Object[]{course.getId()});
            return course;
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error generating course: {0}", new Object[]{e.getMessage()});
            throw e;
        }
    }

    @PutMapping("/{courseId}")
    public ResponseEntity<ApiResponse<Course>> updateCourseName(@PathVariable Long courseId,
                                                                @RequestBody Course courseDO) throws Exception {
        LOGGER.log(Level.INFO, "Request received to update course ID: {0}", new Object[]{courseId});
        try {
            courseServiceImpl.updateCourse(courseId, courseDO);
            LOGGER.log(Level.INFO, "Course ID: {0} updated successfully", new Object[]{courseId});
            return ResponseEntity.ok(ApiResponse.success("Course updated successfully", null));
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error updating course ID: {0}: {1}", new Object[]{courseId, e.getMessage()});
            throw e;
        }
    }

    @GetMapping("/my-courses")
    public List<Course> getMyCourses(Authentication auth) throws Exception {
        LOGGER.log(Level.INFO, "Fetching courses for user: {0}", new Object[]{auth.getName()});
        try {
            UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
            Long userId = principal.getUser().getId();
            List<Course> courses = courseServiceImpl.getCoursesByCreator(userId);
            LOGGER.log(Level.INFO, "Found {0} courses for user: {1}", new Object[]{courses.size(), auth.getName()});
            return courses;
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching courses for user: {0}: {1}",
                    new Object[]{auth.getName(), e.getMessage()});
            throw e;
        }
    }

    @GetMapping("/shared-by-me")
    public List<Course> getCoursesSharedByMe(Authentication auth) throws Exception {
        LOGGER.log(Level.INFO, "Fetching courses shared by user: {0}", new Object[]{auth.getName()});
        try {
            UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
            Long userId = principal.getUser().getId();
            List<Course> courses = courseServiceImpl.getCoursesSharedByCreator(userId);
            LOGGER.log(Level.INFO, "Found {0} shared courses for user: {1}",
                    new Object[]{courses.size(), auth.getName()});
            return courses;
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching shared courses for user: {0}: {1}",
                    new Object[]{auth.getName(), e.getMessage()});
            throw e;
        }
    }

    @GetMapping("/{id}")
    public Course getCourse(@PathVariable Long id) throws Exception {
        LOGGER.log(Level.INFO, "Fetching course details for ID: {0}", new Object[]{id});
        try {
            Course course = courseServiceImpl.getCourseById(id);
            LOGGER.log(Level.INFO, "Course details retrieved for ID: {0}", new Object[]{id});
            return course;
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching course ID: {0}: {1}", new Object[]{id, e.getMessage()});
            throw e;
        }
    }

    @GetMapping("/{courseName}/modules")
    public List<Module> getModulesByCourseName(@PathVariable String courseName) throws Exception {
        LOGGER.log(Level.INFO, "Fetching modules for course: {0}", new Object[]{courseName});
        try {
            List<Module> modules = courseServiceImpl.getModulesByCourseName(courseName);
            LOGGER.log(Level.INFO, "Found {0} modules for course: {1}", new Object[]{modules.size(), courseName});
            return modules;
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching modules for course: {0}: {1}",
                    new Object[]{courseName, e.getMessage()});
            throw e;
        }
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long courseId) throws Exception {
        LOGGER.log(Level.INFO, "Request received to delete course ID: {0}", new Object[]{courseId});
        try {
            courseServiceImpl.deleteCourse(courseId);
            LOGGER.log(Level.INFO, "Course ID: {0} deleted successfully", new Object[]{courseId});
            return ResponseEntity.ok(ApiResponse.success("Course deleted successfully", null));
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error deleting course ID: {0}: {1}", new Object[]{courseId, e.getMessage()});
            throw e;
        }
    }
}