package com.leaderboard.dto;

public class LeaderboardResponseDTO extends RankScoreDTO {
    public LeaderboardResponseDTO(int rank, Long userId, int score, String username, int coursesCompleted, int currentStreak, int weeklyPoints) {
        this.rank = rank;
        this.userId = userId;
        this.score = score;
        this.username = username;
        this.coursesCompleted = coursesCompleted;
        this.currentStreak = currentStreak;
        this.weeklyPoints = weeklyPoints;
    }
}