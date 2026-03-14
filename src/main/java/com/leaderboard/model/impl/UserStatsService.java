package com.leaderboard.model.impl;

import com.aicourse.repo.LessonRepo;
import com.leaderboard.model.UserStats;
import com.leaderboard.repository.UserStatsRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.logging.Logger;

@Service
public class UserStatsService {

    private static final Logger LOGGER = Logger.getLogger(UserStatsService.class.getName());
    private static final int LESSON_POINTS = 10;
    private static final int COURSE_COMPLETION_BONUS = 50;

    @Autowired
    private UserStatsRepository userStatsRepository;

    @Autowired
    private LessonRepo lessonRepo;

    @Transactional
    public void recordLessonCompleted(Long userId, Long courseId) {

        UserStats stats = userStatsRepository.findByUserId(userId)
                .orElseGet(() -> userStatsRepository.save(new UserStats(userId)));

        stats.addPoints(LESSON_POINTS);
        stats.incrementLessonsCompleted();

        boolean allLessonsDone =
                lessonRepo.countUnenrichedLessonsByCourseId(courseId) == 0;

        if (allLessonsDone) {
            stats.addPoints(COURSE_COMPLETION_BONUS);
            stats.incrementCoursesCompleted();
        }

        userStatsRepository.save(stats);
    }

    public void incrementTotalCoursesCreated(Long userId) {
        UserStats stats = getOrCreate(userId);
        stats.incrementTotalCoursesCreated();
        userStatsRepository.save(stats);
    }


    public void incrementTotalProjectsCreated(Long userId) {
        UserStats stats = getOrCreate(userId);
        stats.incrementTotalProjectsCreated();
        userStatsRepository.save(stats);
    }

    public int getTotalCoursesCreated(Long userId) {
        return userStatsRepository.findByUserId(userId)
                .map(UserStats::getTotalCoursesCreated)
                .orElse(0);
    }

    public int getTotalProjectsCreated(Long userId) {
        return userStatsRepository.findByUserId(userId)
                .map(UserStats::getTotalProjectsCreated)
                .orElse(0);
    }

    private UserStats getOrCreate(Long userId) {
        return userStatsRepository.findByUserId(userId)
                .orElseGet(() -> userStatsRepository.save(new UserStats(userId)));
    }
}
