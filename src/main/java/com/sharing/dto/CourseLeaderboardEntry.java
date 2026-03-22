package com.sharing.dto;

public class CourseLeaderboardEntry {
    private Long userId;
    private String username;
    private Integer rank;
    private Double totalProgress;
    private Integer coursesCompleted;
    private Integer lessonsCompleted;

    // --- Constructors ---
    public CourseLeaderboardEntry() {
    }

    public CourseLeaderboardEntry(Long userId, String username, Integer rank,
                                  Double totalProgress, Integer coursesCompleted,
                                  Integer lessonsCompleted) {
        this.userId = userId;
        this.username = username;
        this.rank = rank;
        this.totalProgress = totalProgress;
        this.coursesCompleted = coursesCompleted;
        this.lessonsCompleted = lessonsCompleted;
    }

    // --- Getters and Setters ---
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Integer getRank() {
        return rank;
    }

    public void setRank(Integer rank) {
        this.rank = rank;
    }

    public Double getTotalProgress() {
        return totalProgress;
    }

    public void setTotalProgress(Double totalProgress) {
        this.totalProgress = totalProgress;
    }

    public Integer getCoursesCompleted() {
        return coursesCompleted;
    }

    public void setCoursesCompleted(Integer coursesCompleted) {
        this.coursesCompleted = coursesCompleted;
    }

    public Integer getLessonsCompleted() {
        return lessonsCompleted;
    }

    public void setLessonsCompleted(Integer lessonsCompleted) {
        this.lessonsCompleted = lessonsCompleted;
    }
}

