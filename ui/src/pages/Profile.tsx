import { useEffect, useState } from "react";
import { User, Lock, Award, BookOpen, Zap, Flame, TrendingUp, CheckCircle, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProfile, updateProfile, changePassword } from "@/services/aboutApi";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Section = "profile" | "security";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<Section>("profile");

  // Profile edit state
  const [newUsername, setNewUsername] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      try {
        const data = await getProfile();
        const normalized = data?.data ?? data;
        if (mounted) {
          setProfile(normalized);
          setNewUsername(normalized?.username ?? "");
        }
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadProfile();
    return () => { mounted = false; };
  }, []);

  const handleSaveProfile = async () => {
    if (!newUsername.trim()) {
      toast.error("Username cannot be empty");
      return;
    }
    try {
      setSavingProfile(true);
      const updated = await updateProfile(newUsername.trim());
      const normalized = updated?.data ?? updated;
      setProfile(normalized);
      if (normalized?.token && setUser) {
        localStorage.setItem("token", normalized.token);
        setUser({ ...(user ?? {}), username: normalized.username });
      }
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      setSavingPassword(true);
      await changePassword(currentPassword, newPassword, confirmPassword);
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  const stats = profile?.stats;

  const statCards = [
    {
      label: "Total Points",
      value: stats?.totalPoints ?? 0,
      icon: Award,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
    },
    {
      label: "Weekly Points",
      value: stats?.weeklyPoints ?? 0,
      icon: TrendingUp,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Courses Completed",
      value: stats?.coursesCompleted ?? 0,
      icon: BookOpen,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      label: "Lessons Completed",
      value: stats?.lessonsCompleted ?? 0,
      icon: CheckCircle,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Current Streak",
      value: `${stats?.currentStreak ?? 0}d`,
      icon: Flame,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="gradient-header px-8 pb-8 pt-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-2xl font-bold text-primary-foreground font-display shadow-lg">
            {(profile?.username ?? user?.username ?? "U")[0].toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              {loading ? "Loading..." : profile?.username ?? user?.username ?? "Profile"}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground capitalize">
              {profile?.role?.toLowerCase() ?? "user"} · Member since{" "}
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })
                : "—"}
            </p>
          </div>
        </div>

        {/* Section tabs */}
        <div className="mt-6 flex gap-1 rounded-lg bg-secondary/50 p-1 w-fit">
          {(["profile", "security"] as Section[]).map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium capitalize transition-all duration-200",
                section === s
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s === "profile" ? "Profile" : "Security"}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8 space-y-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="glass-card rounded-xl h-24 animate-pulse bg-secondary/40" />
            ))}
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {statCards.map((card) => (
                <div key={card.label} className="glass-card rounded-xl p-4">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg mb-3", card.bg)}>
                    <card.icon className={cn("h-5 w-5", card.color)} />
                  </div>
                  <p className="font-display text-2xl font-bold text-foreground">{card.value.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Profile Section */}
            {section === "profile" && (
              <div className="glass-card rounded-xl p-6 max-w-lg">
                <div className="flex items-center gap-2 mb-6">
                  <Pencil className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-lg font-semibold text-foreground">Edit Profile</h2>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Username</label>
                    <Input
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Enter new username"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Role</label>
                    <Input
                      value={profile?.role ?? "—"}
                      disabled
                      className="opacity-60 cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">Role cannot be changed.</p>
                  </div>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={savingProfile || newUsername === profile?.username}
                    variant="gradient"
                    className="gap-2"
                  >
                    {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <User className="h-4 w-4" />}
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}

            {/* Security Section */}
            {section === "security" && (
              <div className="glass-card rounded-xl p-6 max-w-lg">
                <div className="flex items-center gap-2 mb-6">
                  <Lock className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-lg font-semibold text-foreground">Change Password</h2>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Current Password</label>
                    <Input
                      type="password"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">New Password</label>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleChangePassword}
                    disabled={savingPassword}
                    variant="gradient"
                    className="gap-2"
                  >
                    {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                    {savingPassword ? "Changing..." : "Change Password"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
