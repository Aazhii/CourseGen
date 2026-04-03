package com.leaderboard.dto;

public class UserRankDTO extends RankScoreDTO {
    public UserRankDTO(int rank, Long userId, int score, String username, int coursesCompleted, int currentStreak, int weeklyPoints) {
        this.rank = rank;
        this.userId = userId;
        this.score = score;
        this.username = username;
        this.coursesCompleted = coursesCompleted;
        this.currentStreak = currentStreak;
        this.weeklyPoints = weeklyPoints;
    }
}
