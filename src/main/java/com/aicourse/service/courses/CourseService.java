package com.aicourse.service.courses;

import com.aicourse.model.Course;
import com.aicourse.model.Module;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Map;

public interface CourseService {

    Course generateCourse(Map<String, String> payload, Authentication auth) throws Exception;

    List<Course> getCoursesByCreator(Long creator) throws Exception;

    List<Course> getCoursesSharedByCreator(Long creator) throws Exception;

    Course getCourseById(Long id) throws Exception;

    List<Module> getModulesByCourseName(String courseName) throws Exception;

    void deleteCourse(Long courseId) throws Exception;

    void updateCourse(Long courseID, Course courseDO) throws Exception;

    void deactivateCourse(Long courseId) throws Exception;

    void activateCourse(Long courseId) throws Exception;

}