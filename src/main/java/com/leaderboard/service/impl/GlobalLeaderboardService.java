package com.leaderboard.service.impl;

import com.leaderboard.dto.LeaderboardResponseDTO;
import com.leaderboard.dto.PagedLeaderboardDTO;
import com.leaderboard.dto.UserRankDTO;
import com.leaderboard.model.UserStats;
import com.leaderboard.repository.UserStatsRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class GlobalLeaderboardService extends AbstractLeaderboardService {

    public GlobalLeaderboardService(UserStatsRepository userStatsRepository) {
        super(userStatsRepository);
    }

    @Override
    protected int getScore(UserStats user) {
        return user.getTotalPoints();
    }

    @Override
    public PagedLeaderboardDTO getTopGlobalUsers(int page, int size) {
        List<UserStats> all = userStatsRepository.findAllOrderByTotalPoints();
        return paginate(all, page, size);
    }

    @Override
    public UserRankDTO getUserRankDTO(Long userId) {
        List<UserStats> all = fetchAllOrdered();
        AtomicInteger rank = new AtomicInteger(1);
        for (UserStats user : all) {
            if (userId.equals(user.getUserId())) {
                return new UserRankDTO(rank.get(), user.getUserId(), getScore(user));
            }
            rank.incrementAndGet();
        }
        return null;
    }

    private List<UserStats> fetchAllOrdered() {
        return userStatsRepository.findAllOrderByTotalPoints();
    }

    private PagedLeaderboardDTO paginate(List<UserStats> all, int page, int size) {
        int total = all.size();
        int fromIndex = Math.min(page * size, total);
        int toIndex = Math.min(fromIndex + size, total);

        List<LeaderboardResponseDTO> paged = buildLeaderBoard(all.subList(fromIndex, toIndex));

        int totalPages = (int) Math.ceil((double) total / size);
        return new PagedLeaderboardDTO(paged, page, size, total, totalPages);
    }
}