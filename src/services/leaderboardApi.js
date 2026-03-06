import { apiFetch } from "./apiClient";

export async function getGlobalLeaderboard(page = 0, size = 10) {
    return apiFetch(`/api/leaderboard/global?page=${page}&size=${size}`);
}

export async function getMyRank() {
    return apiFetch("/api/leaderboard/me");
}
