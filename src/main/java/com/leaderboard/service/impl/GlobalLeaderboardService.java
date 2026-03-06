package com.leaderboard.service.impl;

import com.leaderboard.dto.LeaderboardResponseDTO;
import com.leaderboard.dto.PagedLeaderboardDTO;
import com.leaderboard.dto.UserRankDTO;
import com.leaderboard.model.UserStats;
import com.leaderboard.repository.UserStatsRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class GlobalLeaderboardService extends AbstractLeaderboardService {

    private static final long CACHE_TTL_MS = 3 * 60 * 1000L; // 3 min for leaderboard cache

    private final AtomicReference<List<UserStats>> cachedLeaderboard = new AtomicReference<>(null);
    private volatile long lastFetchedAt = 0L; // timestamp of last DB fetch

    public GlobalLeaderboardService(UserStatsRepository userStatsRepository) {
        super(userStatsRepository);
    }

    @Override
    protected int getScore(UserStats user) {
        return user.getTotalPoints();
    }

    @Override
    public PagedLeaderboardDTO getTopGlobalUsers(int page, int size) {
        List<UserStats> all = getOrLoadLeaderboard();
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

    /**
     * Returns leaderboard from cache if within TTL window,
     * otherwise fetches fresh data from DB and resets the timer.
     */
    private List<UserStats> getOrLoadLeaderboard() {
        Long curTime = System.currentTimeMillis();
        List<UserStats> cachedLeaderBoard = cachedLeaderboard.get();

        if (cachedLeaderBoard != null && (curTime - lastFetchedAt) < CACHE_TTL_MS) {
            return cachedLeaderBoard;
        }

        // Cache expired or empty — fetch from DB
        List<UserStats> newLeaderBoard = userStatsRepository.findAllOrderByTotalPoints();
        cachedLeaderboard.set(newLeaderBoard);
        lastFetchedAt = curTime;
        return newLeaderBoard;
    }
}