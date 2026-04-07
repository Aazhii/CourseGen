package com.leaderboard.service.impl;

import com.auth.model.Users;
import com.auth.repo.UserRepo;
import com.leaderboard.dto.LeaderboardResponseDTO;
import com.leaderboard.dto.PagedLeaderboardDTO;
import com.leaderboard.dto.UserRankDTO;
import com.leaderboard.model.UserStats;
import com.leaderboard.repository.UserStatsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class GlobalLeaderboardService extends AbstractLeaderboardService {

    @Autowired
    private UserRepo userRepo;

    public GlobalLeaderboardService(UserStatsRepository userStatsRepository) {
        super(userStatsRepository);
    }

    @Override
    protected int getScore(UserStats user) {
        return user.getTotalPoints();
    }

    @Override
    public PagedLeaderboardDTO getTopGlobalUsers(int page, int size) {
        List<UserStats> all = fetchAllOrdered();
        return paginate(all, page, size);
    }

    @Override
    public UserRankDTO getUserRankDTO(Long userId) {
        List<UserStats> all = fetchAllOrdered();
        AtomicInteger rank = new AtomicInteger(1);
        for (UserStats user : all) {
            if (userId.equals(user.getUserId())) {
                Users u = userRepo.findById(userId).orElse(null);
                String displayName = (u != null && u.getDisplayName() != null && !u.getDisplayName().isBlank())
                        ? u.getDisplayName()
                        : (u != null ? u.getUsername() : "Unknown");
                String handle = u != null ? u.getUsername() : "";
                return new UserRankDTO(rank.get(), user.getUserId(), getScore(user), displayName, handle, user.getTotalCoursesCreated(), user.getCurrentStreak(), user.getWeeklyPoints());
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

        List<LeaderboardResponseDTO> paged = buildLeaderBoard(all.subList(fromIndex, toIndex), fromIndex);

        // Populate displayName and handle
        for (LeaderboardResponseDTO dto : paged) {
            userRepo.findById(dto.getUserId()).ifPresent(u -> {
                String displayName = (u.getDisplayName() == null || u.getDisplayName().isBlank())
                        ? u.getUsername()
                        : u.getDisplayName();
                dto.setDisplayName(displayName);
                dto.setHandle(u.getUsername());
                dto.setUsername(displayName);
            });
        }

        int totalPages = (int) Math.ceil((double) total / size);
        return new PagedLeaderboardDTO(paged, page, size, total, totalPages);
    }
}