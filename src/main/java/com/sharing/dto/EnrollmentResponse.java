package com.sharing.dto;

import com.sharing.model.EnrollmentStatus;

import java.time.OffsetDateTime;

public class EnrollmentResponse {
    private Long id;
    private Long courseId;
    private Long userId;
    private EnrollmentStatus status;
    private OffsetDateTime enrolledAt;
    private Double progressPercentage;
    private String courseName;
    private Boolean isRead;
    private String inviteStatus;
    private Long invitedBy;
    private String invitedByName;

    // --- Constructors ---
    public EnrollmentResponse() {
    }

    public EnrollmentResponse(Long id, Long courseId, Long userId, EnrollmentStatus status,
                              OffsetDateTime enrolledAt, Double progressPercentage, String courseName) {
        this.id = id;
        this.courseId = courseId;
        this.userId = userId;
        this.status = status;
        this.enrolledAt = enrolledAt;
        this.progressPercentage = progressPercentage;
        this.courseName = courseName;
    }

    public EnrollmentResponse(Long id, Long courseId, Long userId, EnrollmentStatus status,
                              OffsetDateTime enrolledAt, Double progressPercentage, String courseName,
                              Boolean isRead, String inviteStatus, Long invitedBy, String invitedByName) {
        this.id = id;
        this.courseId = courseId;
        this.userId = userId;
        this.status = status;
        this.enrolledAt = enrolledAt;
        this.progressPercentage = progressPercentage;
        this.courseName = courseName;
        this.isRead = isRead;
        this.inviteStatus = inviteStatus;
        this.invitedBy = invitedBy;
        this.invitedByName = invitedByName;
    }

    // --- Getters and Setters ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public EnrollmentStatus getStatus() {
        return status;
    }

    public void setStatus(EnrollmentStatus status) {
        this.status = status;
    }

    public OffsetDateTime getEnrolledAt() {
        return enrolledAt;
    }

    public void setEnrolledAt(OffsetDateTime enrolledAt) {
        this.enrolledAt = enrolledAt;
    }

    public Double getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Double progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public String getInviteStatus() {
        return inviteStatus;
    }

    public void setInviteStatus(String inviteStatus) {
        this.inviteStatus = inviteStatus;
    }

    public Long getInvitedBy() {
        return invitedBy;
    }

    public void setInvitedBy(Long invitedBy) {
        this.invitedBy = invitedBy;
    }

    public String getInvitedByName() {
        return invitedByName;
    }

    public void setInvitedByName(String invitedByName) {
        this.invitedByName = invitedByName;
    }
}

