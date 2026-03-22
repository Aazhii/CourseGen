package com.sharing.repo;

import com.sharing.model.CourseEnrollment;
import com.sharing.model.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseEnrollmentRepo extends JpaRepository<CourseEnrollment, Long> {
    Optional<CourseEnrollment> findByCourseIdAndUserId(Long courseId, Long userId);

    List<CourseEnrollment> findByUserId(Long userId);

    List<CourseEnrollment> findByCourseId(Long courseId);

    List<CourseEnrollment> findByUserIdAndStatus(Long userId, EnrollmentStatus status);

    List<CourseEnrollment> findByCourseIdAndStatus(Long courseId, EnrollmentStatus status);

    int countByCourseIdAndStatus(Long courseId, EnrollmentStatus status);

    int countByUserId(Long userId);

    boolean existsByCourseIdAndUserId(Long courseId, Long userId);
}

