package com.sharing.service.impl;

import com.aicourse.model.Course;
import com.aicourse.repo.CourseRepo;
import com.aicourse.repo.LessonRepo;
import com.sharing.dto.CourseProgressResponse;
import com.sharing.dto.EnrollmentResponse;
import com.sharing.model.CourseEnrollment;
import com.sharing.model.EnrollmentStatus;
import com.sharing.model.LessonProgress;
import com.sharing.repo.CourseEnrollmentRepo;
import com.sharing.repo.LessonProgressRepo;
import com.sharing.service.LessonProgressService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class LessonProgressServiceImpl implements LessonProgressService {

    private static final Logger LOGGER = Logger.getLogger(LessonProgressServiceImpl.class.getName());

    @Autowired
    private LessonProgressRepo lessonProgressRepo;

    @Autowired
    private CourseEnrollmentRepo courseEnrollmentRepo;

    @Autowired
    private CourseRepo courseRepo;

    @Autowired
    private LessonRepo lessonRepo;

    @Override
    @Transactional
    public void markLessonComplete(Long lessonId, Long courseId, Long userId) throws Exception {
        LOGGER.log(Level.INFO, "Marking lesson {0} complete for user {1}", new Object[]{lessonId, userId});

        try {
            // Ensure enrollment exists; creators are auto-enrolled on first progress interaction.
            getOrCreateEnrollment(courseId, userId);

            // Get or create lesson progress
            Optional<LessonProgress> existingProgress = lessonProgressRepo.findByLessonIdAndUserId(lessonId, userId);
            LessonProgress lessonProgress;

            if (existingProgress.isPresent()) {
                lessonProgress = existingProgress.get();
            } else {
                lessonProgress = new LessonProgress(lessonId, userId, courseId);
            }

            lessonProgress.setIsCompleted(true);
            lessonProgress.setCompletedAt(OffsetDateTime.now());
            lessonProgress.setProgressPercentage(100.0);
            lessonProgress.setUpdatedAt(OffsetDateTime.now());

            lessonProgressRepo.save(lessonProgress);

            // Update course enrollment progress
            updateEnrollmentProgress(courseId, userId);
            LOGGER.log(Level.INFO, "Lesson marked as complete successfully");
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error marking lesson complete: {0}", e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional
    public void markLessonIncomplete(Long lessonId, Long courseId, Long userId) throws Exception {
        LOGGER.log(Level.INFO, "Marking lesson {0} incomplete for user {1}", new Object[]{lessonId, userId});

        try {
            Optional<LessonProgress> lessonProgress = lessonProgressRepo.findByLessonIdAndUserId(lessonId, userId);

            if (lessonProgress.isPresent()) {
                LessonProgress progress = lessonProgress.get();
                progress.setIsCompleted(false);
                progress.setCompletedAt(null);
                progress.setProgressPercentage(0.0);
                progress.setUpdatedAt(OffsetDateTime.now());
                lessonProgressRepo.save(progress);

                // Update course enrollment progress
                updateEnrollmentProgress(courseId, userId);
                LOGGER.log(Level.INFO, "Lesson marked as incomplete successfully");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error marking lesson incomplete: {0}", e.getMessage());
            throw e;
        }
    }

    @Override
    public CourseProgressResponse getUserCourseProgress(Long courseId, Long userId) throws Exception {
        LOGGER.log(Level.INFO, "Fetching course progress for user {0} in course {1}", new Object[]{userId, courseId});

        try {
            CourseEnrollment enrollment = getOrCreateEnrollment(courseId, userId);

            Course course = courseRepo.findById(courseId)
                    .orElseThrow(() -> new IllegalArgumentException("Course not found"));

            int totalLessons = getTotalLessonsInCourse(courseId);
            int completedLessons = getCompletedLessonsCount(courseId, userId);
            double progress = totalLessons > 0 ? (completedLessons * 100.0 / totalLessons) : 0.0;

            return new CourseProgressResponse(
                    courseId,
                    course.getTitle(),
                    progress,
                    totalLessons,
                    completedLessons,
                    enrollment.getEnrolledAt(),
                    null // TODO: Get last accessed timestamp
            );
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching course progress: {0}", e.getMessage());
            throw e;
        }
    }

    @Override
    public List<CourseProgressResponse> getUserAllProgress(Long userId) throws Exception {
        LOGGER.log(Level.INFO, "Fetching all course progress for user {0}", userId);

        try {
            List<CourseEnrollment> enrollments = courseEnrollmentRepo.findByUserIdAndStatus(userId, EnrollmentStatus.ACTIVE);

            return enrollments.stream()
                    .map(enrollment -> {
                        try {
                            Course course = courseRepo.findById(enrollment.getCourseId()).orElse(null);
                            if (course != null && course.getCreator().equals(userId)) {
                                return null; // Exclude courses created by the user from "Shared With Me"
                            }
                            return getUserCourseProgress(enrollment.getCourseId(), userId);
                        } catch (Exception e) {
                            LOGGER.log(Level.SEVERE, "Error fetching progress for course {0}: {1}",
                                    new Object[]{enrollment.getCourseId(), e.getMessage()});
                            return null;
                        }
                    })
                    .filter(progress -> progress != null)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching all user progress: {0}", e.getMessage());
            throw e;
        }
    }

    @Override
    public EnrollmentResponse getEnrollment(Long courseId, Long userId) throws Exception {
        LOGGER.log(Level.INFO, "Fetching enrollment for user {0} in course {1}", new Object[]{userId, courseId});

        try {
            CourseEnrollment enrollment = courseEnrollmentRepo.findByCourseIdAndUserId(courseId, userId)
                    .orElseThrow(() -> new IllegalArgumentException("Enrollment not found"));

            Course course = courseRepo.findById(courseId)
                    .orElseThrow(() -> new IllegalArgumentException("Course not found"));

            return new EnrollmentResponse(
                    enrollment.getId(),
                    enrollment.getCourseId(),
                    enrollment.getUserId(),
                    enrollment.getStatus(),
                    enrollment.getEnrolledAt(),
                    enrollment.getProgressPercentage(),
                    course.getTitle()
            );
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching enrollment: {0}", e.getMessage());
            throw e;
        }
    }

    @Override
    public List<EnrollmentResponse> getCourseEnrollments(Long courseId) throws Exception {
        LOGGER.log(Level.INFO, "Fetching all enrollments for course {0}", courseId);

        try {
            Course course = courseRepo.findById(courseId)
                    .orElseThrow(() -> new IllegalArgumentException("Course not found"));

            List<CourseEnrollment> enrollments = courseEnrollmentRepo.findByCourseId(courseId);

            return enrollments.stream()
                    .map(enrollment -> new EnrollmentResponse(
                            enrollment.getId(),
                            enrollment.getCourseId(),
                            enrollment.getUserId(),
                            enrollment.getStatus(),
                            enrollment.getEnrolledAt(),
                            enrollment.getProgressPercentage(),
                            course.getTitle()
                    ))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error fetching course enrollments: {0}", e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional
    public EnrollmentResponse enrollUserInCourse(Long courseId, Long userId, Long shareLinkId) throws Exception {
        LOGGER.log(Level.INFO, "Enrolling user {0} in course {1}", new Object[]{userId, courseId});

        try {
            // Check if already enrolled
            if (courseEnrollmentRepo.findByCourseIdAndUserId(courseId, userId).isPresent()) {
                throw new IllegalArgumentException("User is already enrolled in this course");
            }

            Course course = courseRepo.findById(courseId)
                    .orElseThrow(() -> new IllegalArgumentException("Course not found"));

            if (course.getCreator().equals(userId)) {
                throw new IllegalArgumentException("You are the creator of this course and already have full access.");
            }

            // Create new enrollment
            CourseEnrollment enrollment = new CourseEnrollment(courseId, userId, shareLinkId);
            CourseEnrollment savedEnrollment = courseEnrollmentRepo.save(enrollment);

            LOGGER.log(Level.INFO, "User enrolled successfully");
            return new EnrollmentResponse(
                    savedEnrollment.getId(),
                    savedEnrollment.getCourseId(),
                    savedEnrollment.getUserId(),
                    savedEnrollment.getStatus(),
                    savedEnrollment.getEnrolledAt(),
                    savedEnrollment.getProgressPercentage(),
                    course.getTitle()
            );
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error enrolling user: {0}", e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional
    public void updateEnrollmentStatus(Long courseId, Long userId, EnrollmentStatus status) throws Exception {
        LOGGER.log(Level.INFO, "Updating enrollment status for user {0} to {1}", new Object[]{userId, status});

        try {
            CourseEnrollment enrollment = courseEnrollmentRepo.findByCourseIdAndUserId(courseId, userId)
                    .orElseThrow(() -> new IllegalArgumentException("Enrollment not found"));

            enrollment.setStatus(status);
            courseEnrollmentRepo.save(enrollment);
            LOGGER.log(Level.INFO, "Enrollment status updated successfully");
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error updating enrollment status: {0}", e.getMessage());
            throw e;
        }
    }

    @Override
    public int getCompletedLessonsCount(Long courseId, Long userId) throws Exception {
        return lessonProgressRepo.countByUserIdAndCourseIdAndIsCompletedTrue(userId, courseId);
    }

    @Override
    public int getTotalLessonsInCourse(Long courseId) throws Exception {
        return (int) lessonRepo.countByCourseId(courseId);
    }

    // --- Helper methods ---
    private CourseEnrollment getOrCreateEnrollment(Long courseId, Long userId) {
        Optional<CourseEnrollment> existing = courseEnrollmentRepo.findByCourseIdAndUserId(courseId, userId);
        if (existing.isPresent()) {
            return existing.get();
        }

        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        // Allow the course creator to track own progress without manual self-enrollment.
        if (course.getCreator().equals(userId)) {
            CourseEnrollment creatorEnrollment = new CourseEnrollment(courseId, userId, null);
            return courseEnrollmentRepo.save(creatorEnrollment);
        }

        throw new IllegalArgumentException("User is not enrolled in this course");
    }

    private void updateEnrollmentProgress(Long courseId, Long userId) throws Exception {
        CourseEnrollment enrollment = courseEnrollmentRepo.findByCourseIdAndUserId(courseId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Enrollment not found"));

        int totalLessons = getTotalLessonsInCourse(courseId);
        int completedLessons = getCompletedLessonsCount(courseId, userId);
        double progress = totalLessons > 0 ? (completedLessons * 100.0 / totalLessons) : 0.0;

        enrollment.setProgressPercentage(progress);
        courseEnrollmentRepo.save(enrollment);
    }
}
