package com.leaderboard.dto;

public abstract class RankScoreDTO {
    protected int rank;
    protected Long userId;
    protected int score;
    protected String username;
    protected int coursesCompleted;
    protected int currentStreak;
    protected int weeklyPoints;

    public int getRank() { return rank; }

    public void setRank(int rank) {
        this.rank = rank;
    }

    public Long getUserId() { return userId; }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public int getScore() { return score; }

    public void setScore(int score) {
        this.score = score;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public int getCoursesCompleted() {
        return coursesCompleted;
    }

    public void setCoursesCompleted(int coursesCompleted) {
        this.coursesCompleted = coursesCompleted;
    }

    public int getCurrentStreak() {
        return currentStreak;
    }

    public void setCurrentStreak(int currentStreak) {
        this.currentStreak = currentStreak;
    }

    public int getWeeklyPoints() {
        return weeklyPoints;
    }

    public void setWeeklyPoints(int weeklyPoints) {
        this.weeklyPoints = weeklyPoints;
    }
}
