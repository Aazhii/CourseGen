import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchSharedWithMeInvites,
  fetchInviteSummary,
  acceptInvite,
  declineInvite,
  markInviteRead,
  markAllInvitesRead,
} from "@/services/inviteApi";
import { getProfile } from "@/services/aboutApi";

// ─── Unified Notification Type ─────────────────────────────────────
export type NotificationType =
  | "invite"      // course share invite (real: inviteApi)
  | "achievement" // derived from user stats milestones
  | "system";     // welcome / first-time events

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt?: string;
  // Invite-specific (for accept/decline actions)
  inviteId?: string;
  inviteStatus?: "PENDING" | "ACCEPTED" | "DECLINED";
  courseId?: string;
}

// ─── Milestone derivation from profile stats ────────────────────────
function deriveAchievements(stats: any): AppNotification[] {
  if (!stats) return [];
  const achievements: AppNotification[] = [];

  if (stats.totalPoints >= 1) {
    achievements.push({
      id: "ach-points",
      type: "achievement",
      title: "Points Earned",
      message: `You've earned ${stats.totalPoints} total points. Keep learning!`,
      read: true,
      createdAt: undefined,
    });
  }
  if (stats.lessonsCompleted >= 1) {
    achievements.push({
      id: "ach-lessons",
      type: "achievement",
      title: "Lessons Completed",
      message: `You've completed ${stats.lessonsCompleted} lesson${stats.lessonsCompleted > 1 ? "s" : ""}. Great progress!`,
      read: true,
      createdAt: undefined,
    });
  }
  if (stats.coursesCompleted >= 1) {
    achievements.push({
      id: "ach-courses",
      type: "achievement",
      title: "Course Completed",
      message: `You've completed ${stats.coursesCompleted} course${stats.coursesCompleted > 1 ? "s" : ""}. 🎉`,
      read: true,
      createdAt: undefined,
    });
  }
  if (stats.currentStreak >= 3) {
    achievements.push({
      id: "ach-streak",
      type: "achievement",
      title: "On a Streak! 🔥",
      message: `You're on a ${stats.currentStreak}-day learning streak. Keep it going!`,
      read: true,
      createdAt: undefined,
    });
  }

  return achievements;
}

// ─── Invite → AppNotification mapper ───────────────────────────────
function mapInviteToNotification(inv: any): AppNotification {
  const status: "PENDING" | "ACCEPTED" | "DECLINED" =
    inv.status ?? "PENDING";
  const isPending = status === "PENDING";
  return {
    id: `invite-${inv.id ?? inv.inviteId}`,
    type: "invite",
    title: isPending ? "Course Invite" : status === "ACCEPTED" ? "Invite Accepted" : "Invite Declined",
    message: `${inv.invitedByName ?? inv.inviterUsername ?? inv.sharedBy ?? "Someone"} invited you to join "${inv.courseName ?? inv.courseTitle ?? inv.title ?? "a course"}"`,
    read: inv.isRead ?? inv.read ?? !isPending,
    createdAt: inv.createdAt ?? inv.enrolledAt,
    inviteId: String(inv.id ?? inv.inviteId),
    inviteStatus: status,
    courseId: inv.courseId,
  };
}

// ─── Hook ──────────────────────────────────────────────────────────
export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Polling interval ref (30 seconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadAll = useCallback(async () => {
    try {
      const [inviteRaw, profileRaw] = await Promise.allSettled([
        fetchSharedWithMeInvites(),
        getProfile(),
      ]);

      const invites: AppNotification[] =
        inviteRaw.status === "fulfilled" && Array.isArray(inviteRaw.value)
          ? inviteRaw.value.map(mapInviteToNotification)
          : [];

      const stats =
        profileRaw.status === "fulfilled"
          ? (profileRaw.value?.data ?? profileRaw.value)?.stats
          : null;

      const achievements = deriveAchievements(stats);

      // Merge: invites first (most actionable), then achievements
      setNotifications([...invites, ...achievements]);
    } catch {
      // keep previous state
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + polling
  useEffect(() => {
    loadAll();
    intervalRef.current = setInterval(loadAll, 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadAll]);

  // Recompute unread count
  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [notifications]);

  // ─── Actions ─────────────────────────────────────────────────────

  const accept = useCallback(async (notif: AppNotification) => {
    if (!notif.inviteId) return;
    setProcessingId(notif.id);
    try {
      await acceptInvite(notif.inviteId);
      await markInviteRead(notif.inviteId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notif.id ? { ...n, inviteStatus: "ACCEPTED", read: true } : n
        )
      );
    } finally {
      setProcessingId(null);
    }
  }, []);

  const decline = useCallback(async (notif: AppNotification) => {
    if (!notif.inviteId) return;
    setProcessingId(notif.id);
    try {
      await declineInvite(notif.inviteId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notif.id ? { ...n, inviteStatus: "DECLINED", read: true } : n
        )
      );
    } finally {
      setProcessingId(null);
    }
  }, []);

  const markRead = useCallback(async (notif: AppNotification) => {
    if (notif.read) return;
    // Optimistic
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    if (notif.inviteId) {
      try {
        await markInviteRead(notif.inviteId);
      } catch {
        // revert on error
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: false } : n))
        );
      }
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await markAllInvitesRead();
    } catch {
      // silent — UI already updated
    }
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    loadAll();
  }, [loadAll]);

  return {
    notifications,
    unreadCount,
    loading,
    processingId,
    accept,
    decline,
    markRead,
    markAllRead,
    refresh,
  };
}
