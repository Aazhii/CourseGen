package com.sharing.repo;

import com.sharing.model.CourseShareLink;
import com.sharing.model.ShareLinkType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseShareLinkRepo extends JpaRepository<CourseShareLink, Long> {
    Optional<CourseShareLink> findByShareToken(String shareToken);

    List<CourseShareLink> findByCourseId(Long courseId);

    List<CourseShareLink> findByCourseIdAndCreatedBy(Long courseId, Long createdBy);

    List<CourseShareLink> findByCourseIdAndLinkType(Long courseId, ShareLinkType linkType);

    int countByCourseIdAndIsActiveTrue(Long courseId);
}

