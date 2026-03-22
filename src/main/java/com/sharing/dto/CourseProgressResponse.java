package com.sharing.dto;

import java.time.OffsetDateTime;

public class CourseProgressResponse {
    private Long courseId;
    private String courseName;
    private Double courseProgress;
    private Integer totalLessons;
    private Integer completedLessons;
    private OffsetDateTime enrolledAt;
    private OffsetDateTime lastAccessedAt;

    // --- Constructors ---
    public CourseProgressResponse() {
    }

    public CourseProgressResponse(Long courseId, String courseName, Double courseProgress,
                                  Integer totalLessons, Integer completedLessons,
                                  OffsetDateTime enrolledAt, OffsetDateTime lastAccessedAt) {
        this.courseId = courseId;
        this.courseName = courseName;
        this.courseProgress = courseProgress;
        this.totalLessons = totalLessons;
        this.completedLessons = completedLessons;
        this.enrolledAt = enrolledAt;
        this.lastAccessedAt = lastAccessedAt;
    }

    // --- Getters and Setters ---
    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public Double getCourseProgress() {
        return courseProgress;
    }

    public void setCourseProgress(Double courseProgress) {
        this.courseProgress = courseProgress;
    }

    public Integer getTotalLessons() {
        return totalLessons;
    }

    public void setTotalLessons(Integer totalLessons) {
        this.totalLessons = totalLessons;
    }

    public Integer getCompletedLessons() {
        return completedLessons;
    }

    public void setCompletedLessons(Integer completedLessons) {
        this.completedLessons = completedLessons;
    }

    public OffsetDateTime getEnrolledAt() {
        return enrolledAt;
    }

    public void setEnrolledAt(OffsetDateTime enrolledAt) {
        this.enrolledAt = enrolledAt;
    }

    public OffsetDateTime getLastAccessedAt() {
        return lastAccessedAt;
    }

    public void setLastAccessedAt(OffsetDateTime lastAccessedAt) {
        this.lastAccessedAt = lastAccessedAt;
    }
}

