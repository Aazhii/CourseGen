package com.aicourse.service.courses.impl;

import com.aicourse.geminiConnection.GeminiConnection;
import com.aicourse.model.*;
import com.aicourse.model.Module;
import com.aicourse.repo.CourseRepo;
import com.aicourse.repo.ModuleRepo;
import com.aicourse.service.courses.CourseService;
import com.aicourse.utils.id.SnowflakeIdGenerator;
import com.aicourse.utils.json.JsonParserUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.features.Feature;
import com.features.FeatureGuard;
import com.leaderboard.model.impl.UserStatsService;
import com.sharing.model.CourseShareLink;
import com.sharing.repo.CourseEnrollmentRepo;
import com.sharing.repo.CourseShareLinkRepo;
import com.sharing.service.SharedCourseAccessGuard;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class CourseServiceImpl implements CourseService {

    private static final Logger LOGGER = Logger.getLogger(CourseServiceImpl.class.getName());

    @Autowired
    private CourseRepo courseRepo;

    @Autowired
    private ModuleRepo moduleRepo;

    @Autowired
    private GeminiConnection geminiConnection;

    @Autowired
    private FeatureGuard featureGuard;

    @Autowired
    private UserStatsService userStatsService;

    @Autowired
    private CourseShareLinkRepo courseShareLinkRepo;

    @Autowired
    private CourseEnrollmentRepo courseEnrollmentRepo;

    @Autowired
    private SharedCourseAccessGuard sharedCourseAccessGuard;

    @Override
    @Transactional
    public Course generateCourse(Map<String, String> payload, Authentication auth) throws Exception {

        String title = payload.get("title");
        String difficulty = payload.getOrDefault("difficulty", "Beginner");
        String duration = payload.getOrDefault("duration", "2 Hours");
        String creator = auth.getName();
        LOGGER.log(Level.INFO, "Generating course ''{0}'' for user ''{1}'' (Difficulty: {2}, Duration: {3})",
                new Object[]{title, creator, difficulty, duration});
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        Users curUser = principal.getUser();
        Long userId = curUser.getId();

//      int existingCount = courseRepo.countByCreator(userId);
        int lifetimeCount = userStatsService.getTotalCoursesCreated(userId);
        featureGuard.requireWithinLimit(Feature.COURSE_CREATE, curUser.getRoles(), lifetimeCount);

        Course course = new Course();
        course.setId(SnowflakeIdGenerator.generateId());
        course.setTitle(title);

        course.setCreator(userId);

        String prompt = """
                Create a comprehensive course outline about "%s".
                Difficulty: %s
                Duration: %s

                Respond ONLY with raw JSON:
                {
                  "title": "Course Title",
                  "description": "Course Description",
                  "modules": [
                    {
                      "title": "Module Title",
                      "lessons": ["Lesson 1", "Lesson 2"]
                    }
                  ]
                }
                """.formatted(title, difficulty, duration);

        try {
            LOGGER.log(Level.FINE, "Sending prompt to AI for course generation: {0}", new Object[]{title});
            String response = geminiConnection.getResponse(prompt);
            LOGGER.log(Level.FINE, "Received response from AI");

            String cleanJson = JsonParserUtil.extractRawJson(response);
            JsonNode courseJson = JsonParserUtil.parseStringToJsonObject(cleanJson);

            course.setDescription(
                    courseJson.has("description")
                            ? courseJson.get("description").asText()
                            : "Generated course for " + title);

            List<Module> modules = new ArrayList<>();

            JsonNode modulesNode = courseJson.get("modules");
            if (modulesNode == null || !modulesNode.isArray()) {
                LOGGER.log(Level.SEVERE, "Invalid AI response: 'modules' missing or not an array");
                throw new RuntimeException("Invalid AI response: modules missing");
            }

            for (JsonNode moduleNode : modulesNode) {

                Module module = new Module();
                module.setId(SnowflakeIdGenerator.generateId());
                module.setTitle(moduleNode.get("title").asText());
                module.setCourse(course);

                List<Lesson> lessons = new ArrayList<>();

                for (JsonNode lessonNode : moduleNode.get("lessons")) {
                    Lesson lesson = new Lesson();
                    lesson.setId(SnowflakeIdGenerator.generateId());
                    lesson.setTitle(lessonNode.asText());
                    lesson.setContent(JsonParserUtil.parseStringToJsonObject("[]"));
                    lesson.setModule(module);

                    lessons.add(lesson);
                }

                module.setLessons(lessons);
                modules.add(module);
            }

            course.setModules(modules);
            Course savedCourse = courseRepo.save(course);
            userStatsService.incrementTotalCoursesCreated(userId);
            LOGGER.log(Level.INFO, "Course ''{0}'' generated and saved successfully with ID: {1}",
                    new Object[]{title, savedCourse.getId()});
            return savedCourse;

        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Failed to generate course ''{0}'': {1}", new Object[]{title, e.getMessage()});
            throw e; // Re-throw to be handled by controller
        }
    }

    @Override
    public List<Course> getCoursesByCreator(Long creator) throws Exception {
        LOGGER.log(Level.FINE, "Retrieving courses for creator: {0}", new Object[]{creator});
        return courseRepo.findByCreator(creator);
    }

    @Override
    public List<Course> getCoursesSharedByCreator(Long creator) throws Exception {
        LOGGER.log(Level.FINE, "Retrieving courses shared by creator: {0}", new Object[]{creator});
        Set<Long> courseIds = new LinkedHashSet<>(courseShareLinkRepo.findDistinctCourseIdsByCreatedBy(creator));
        courseIds.addAll(courseEnrollmentRepo.findDistinctCourseIdsByInvitedByAndInviteType(creator, "DIRECT"));
        if (courseIds.isEmpty()) {
            return List.of();
        }
        return courseRepo.findAllById(courseIds);
    }

    @Override
    public Course getCourseById(Long id, Long requesterId) throws Exception {
        LOGGER.log(Level.FINE, "Retrieving course by ID: {0}", new Object[]{id});
        Course course = sharedCourseAccessGuard.assertCourseShellAccess(id, requesterId);
        LOGGER.log(Level.FINE, "Course access granted for user {0} and course {1}",
                new Object[]{requesterId, id});
        return course;
    }

    @Override
    public List<Module> getModulesByCourseName(String courseName) throws Exception {
        LOGGER.log(Level.FINE, "Retrieving modules for course name: {0}", new Object[]{courseName});
        return moduleRepo.findByCourse_Title(courseName);
    }

    @Override
    public void deleteCourse(Long courseId) throws Exception {
        LOGGER.log(Level.INFO, "Attempting to delete course with ID: {0}", new Object[]{courseId});
        if (!courseRepo.existsById(courseId)) {
            LOGGER.log(Level.SEVERE, "Cannot delete course. Course not found with ID: {0}", new Object[]{courseId});
            throw new IllegalArgumentException("Course not found with id: " + courseId);
        }
        courseRepo.deleteById(courseId);
        LOGGER.log(Level.INFO, "Course with ID: {0} deleted successfully", new Object[]{courseId});
    }

    @Override
    public void updateCourse(Long courseID, Course courseDO) throws Exception {
        LOGGER.log(Level.INFO, "Updating course with ID: {0}", new Object[]{courseID});
        Course course = courseRepo.findById(courseID).orElseThrow(() -> {
            LOGGER.log(Level.SEVERE, "Cannot update course. Course not found with ID: {0}", new Object[]{courseID});
            return new IllegalArgumentException("Course not found with id: " + courseID);
        });

        if (courseDO.getTitle() != null) {
            course.setTitle(courseDO.getTitle());
        }
        if (courseDO.getCreator() != null) {
            course.setCreator(courseDO.getCreator());
        }
        if (courseDO.getDescription() != null) {
            course.setDescription(courseDO.getDescription());
        }
        if (courseDO.getModules() != null) {
            course.setModules(courseDO.getModules());
        }
        courseRepo.save(course);
        LOGGER.log(Level.INFO, "Course with ID: {0} updated successfully", new Object[]{courseID});
    }

    @Override
    @Transactional
    public void deactivateCourse(Long courseId) throws Exception {
        LOGGER.log(Level.INFO, "Deactivating course with ID: {0}", new Object[]{courseId});
        Course course = courseRepo.findById(courseId).orElseThrow(() -> {
            LOGGER.log(Level.SEVERE, "Cannot deactivate course. Course not found with ID: {0}", new Object[]{courseId});
            return new IllegalArgumentException("Course not found with id: " + courseId);
        });

        course.setActive(false);
        courseRepo.save(course);

        List<CourseShareLink> links = courseShareLinkRepo.findByCourseId(courseId);
        for (CourseShareLink link : links) {
            link.setIsActive(false);
        }
        courseShareLinkRepo.saveAll(links);

        LOGGER.log(Level.INFO, "Course with ID: {0} deactivated successfully", new Object[]{courseId});
    }

    @Override
    @Transactional
    public void activateCourse(Long courseId) throws Exception {
        LOGGER.log(Level.INFO, "Activating course with ID: {0}", new Object[]{courseId});
        Course course = courseRepo.findById(courseId).orElseThrow(() -> {
            LOGGER.log(Level.SEVERE, "Cannot activate course. Course not found with ID: {0}", new Object[]{courseId});
            return new IllegalArgumentException("Course not found with id: " + courseId);
        });

        course.setActive(true);
        courseRepo.save(course);

        List<CourseShareLink> links = courseShareLinkRepo.findByCourseId(courseId);
        for (CourseShareLink link : links) {
            link.setIsActive(true);
        }
        courseShareLinkRepo.saveAll(links);

        LOGGER.log(Level.INFO, "Course with ID: {0} activated successfully", new Object[]{courseId});
    }
}
