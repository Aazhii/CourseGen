package com.leaderboard.dto;

public class LeaderboardResponseDTO extends RankScoreDTO {
    public LeaderboardResponseDTO(int rank, Long userId, int score) {
        this.rank = rank;
        this.userId = userId;
        this.score = score;
    }
}