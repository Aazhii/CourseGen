import { useNavigate, useLocation, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  BookOpen, 
  FolderKanban, 
  Trophy,
  Bell,
  User,
  Sparkles,
  Settings,
  ShieldCheck,
  Lock,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth/AuthContext";
import { useFeature } from "@/hooks/useFeature";
import { Button } from "./ui/button";
import { Logo } from "./Logo";

// Nav groups matching reference structure
const NAV_GROUPS = [
  {
    label: undefined,
    items: [{ label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" }],
  },
  {
    label: "Learn",
    items: [
      { label: "Courses", icon: BookOpen, path: "/courses" },
      { label: "Projects", icon: FolderKanban, path: "/projects" },
    ],
  },
  {
    label: "Tools",
    items: [
      { label: "AI Coach", icon: Bot, path: "/ai-coach", badge: "BETA" },
      { label: "Leaderboard", icon: Trophy, path: "/leaderboard" },
      { label: "Notifications", icon: Bell, path: "/notifications" },
    ],
  },
];

// Each section gets a distinct accent colour for the active border indicator
function getSectionColor(path: string): string {
  if (path === "/" || path.startsWith("/dashboard")) return "oklch(0.72 0.21 285)"; // Purple
  if (path.startsWith("/courses"))    return "oklch(0.7 0.2 240)";  // Blue
  if (path.startsWith("/projects"))   return "oklch(0.7 0.18 160)"; // Emerald
  if (path.startsWith("/ai-coach"))   return "oklch(0.78 0.18 80)"; // Amber
  if (path.startsWith("/leaderboard")) return "oklch(0.78 0.2 65)"; // Trophy Gold
  if (path.startsWith("/admin"))       return "oklch(0.65 0.25 300)"; // Indigo/Purple
  return "oklch(0.6 0.05 260)";                                       // Slate fallback
}

export default function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const adminFeature = useFeature("ADMIN_PANEL");

  const displayName = user?.displayName ?? user?.username ?? "Creator";
  const avatarLetter = displayName[0]?.toUpperCase() ?? "C";

  const allGroups = [
    ...NAV_GROUPS,
    ...(adminFeature.allowed ? [
      {
        label: "Administration",
        items: [
          { label: "LLM Operations", icon: ShieldCheck, path: "/admin/llm" },
        ],
      },
    ] : []),
  ];

  return (
    <aside
      className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r"
      style={{
        background: "var(--sidebar)",
        borderColor: "var(--sidebar-border)",
        color: "var(--sidebar-foreground)",
      }}
    >
      {/* Brand */}
      <div className="px-5 py-6">
        <Logo />
      </div>

      {/* Primary CTA */}
      <div className="px-4 pb-4">
        <Button
          variant="hero"
          className="w-full h-10 rounded-lg justify-start px-3 gap-2.5 bg-gradient-cta shadow-glow text-white border-0"
          onClick={() => navigate("/create-course")}
        >
          <Sparkles className="h-4 w-4" />
          <span className="font-semibold text-sm">New course</span>
        </Button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {allGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <div
                className="mb-1 px-2 text-[11px] font-medium uppercase tracking-wider"
                style={{ color: "var(--muted-foreground)" }}
              >
                {group.label}
              </div>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  location.pathname.startsWith(item.path + "/") ||
                  (item.path === "/dashboard" && location.pathname === "/");
                const accentColor = getSectionColor(item.path);

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        "group flex items-center gap-3 rounded-md px-2 py-1.5 text-sm font-medium transition-colors"
                      )}
                      style={{
                        background: isActive ? "var(--sidebar-active)" : "transparent",
                        color: isActive ? "var(--foreground)" : "var(--sidebar-foreground)",
                        borderLeft: `3px solid ${isActive ? accentColor : "transparent"}`,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background = "var(--sidebar-hover)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                        }
                      }}
                    >
                      <item.icon
                        className="h-4 w-4 shrink-0 transition-colors"
                        style={{ color: isActive ? accentColor : "var(--muted-foreground)" }}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {"badge" in item && item.badge && (
                        <span
                          className="rounded-sm px-1.5 py-0.5 text-[9px] font-semibold tracking-wide"
                          style={{
                            background: "var(--muted)",
                            color: "var(--muted-foreground)",
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer — Spacer or just end */}
      <div className="p-4" />
    </aside>
  );
}
