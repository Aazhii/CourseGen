package com.leaderboard.dto;

public class UserRankDTO extends RankScoreDTO {
    public UserRankDTO(int rank, Long userId, int totalPoints, String username, int courseCount, int currentStreak, int weeklyPoints) {
        this.rank = rank;
        this.userId = userId;
        this.totalPoints = totalPoints;
        this.username = username;
        this.courseCount = courseCount;
        this.currentStreak = currentStreak;
        this.weeklyPoints = weeklyPoints;
    }
}
