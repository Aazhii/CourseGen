package com.aicourse.repo;

import com.aicourse.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LessonRepo extends JpaRepository<Lesson, Long> {
    List<Lesson> findByModuleTitle(String course);
    @Query(
            value = """
            SELECT *
            FROM lessons
            WHERE is_enriched = false
            ORDER BY created_at ASC
            LIMIT 2
        """,
            nativeQuery = true
    )
    List<Lesson> findNext2PendingLessons();

    @Query("""
                SELECT COUNT(l) FROM Lesson l
                WHERE l.module.course.id = :courseId
                AND l.isEnriched = false
            """)
    long countUnenrichedLessonsByCourseId(@Param("courseId") Long courseId);

    @Query("""
                SELECT COUNT(l) FROM Lesson l
                WHERE l.module.course.id = :courseId
            """)
    long countByCourseId(@Param("courseId") Long courseId);
}
