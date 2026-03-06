import { useEffect, useState } from "react";
import { getGlobalLeaderboard, getMyRank } from "../../services/leaderboardApi";
import { Trophy, Medal, Star, Flame, Loader2, Target } from "lucide-react";

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [myRank, setMyRank] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            setLoading(true);
            try {
                const globalRes = await getGlobalLeaderboard(0, 50); // Fetch top 50
                // globalRes is a PagedLeaderboardDTO: { data: [...], page, size, totalElements, totalPages }
                setLeaderboard(globalRes.data || []);

                try {
                    const myRankRes = await getMyRank();
                    setMyRank(myRankRes);
                } catch (rankErr) {
                    console.warn("Could not fetch my rank (possibly no stats yet).", rankErr);
                }
            } catch (err) {
                console.error("Failed to load leaderboard:", err);
                setError("Could not load the leaderboard at this time.");
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboardData();
    }, []);

    if (loading) {
        return (
            <div className="loading-state center" style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Loader2 className="spin" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-text center" style={{ marginTop: "3rem" }}>
                {error}
            </div>
        );
    }

    // Helper for rendering top 3 medals
    const renderMedal = (rank) => {
        if (rank === 1) return <Medal size={28} color="#fbbf24" fill="#f59e0b" />; // Gold
        if (rank === 2) return <Medal size={24} color="#94a3b8" fill="#cbd5e1" />; // Silver
        if (rank === 3) return <Medal size={24} color="#b45309" fill="#d97706" />; // Bronze
        return <span className="rank-number">#{rank}</span>;
    };

    return (
        <div className="dashboard-content leaderboard-container">
            <header className="dashboard-header leaderboard-page-header">
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                    <div className="leaderboard-icon-wrapper">
                        <Trophy size={32} color="white" />
                    </div>
                    <div>
                        <h1 className="leaderboard-page-title">Global Leaderboard</h1>
                        <p className="subtitle leaderboard-subtitle">Compete with the community by completing courses and lessons.</p>
                    </div>
                </div>
            </header>

            {myRank && (
                <div className="my-rank-card">
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div className="my-rank-avatar">
                            You
                        </div>
                        <div>
                            <div className="my-rank-label">Your Rank</div>
                            <div className="my-rank-value">#{myRank.rank}</div>
                        </div>
                    </div>
                    <div style={{ textAlign: "right", display: "flex", gap: "2rem" }}>
                        <div>
                            <div className="my-score-label">Total Score</div>
                            <div className="my-score-value">
                                <Flame size={20} color="#38bdf8" /> {myRank.score}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="leaderboard-list-wrapper">
                {leaderboard.length === 0 ? (
                    <div className="empty-state">
                        <Target size={40} className="text-muted" />
                        <p>No leaderboard data available yet.</p>
                    </div>
                ) : (
                    leaderboard.map((user) => (
                        <div key={user.userId || user.rank} className="leaderboard-row">
                            
                            <div style={{ width: "60px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {renderMedal(user.rank)}
                            </div>
                            
                            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "1rem" }}>
                                <div className="leaderboard-avatar" style={{ background: `hsl(${(user.userId * 137) % 360}, 70%, 40%)` }}>
                                    {/* Using logic to create a pseudo avatar from ID currently */}
                                    {"U" + (user.userId % 100)}
                                </div>
                                <div>
                                    <div className="leaderboard-username">
                                        User {user.userId}
                                    </div>
                                    <div className="leaderboard-type-label">
                                        Points User
                                    </div>
                                </div>
                            </div>

                            <div className="leaderboard-score">
                                {user.score} <Star size={18} fill="#10b981" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
