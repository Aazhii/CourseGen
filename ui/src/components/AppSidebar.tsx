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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "./ui/button";
import { Logo } from "./Logo";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Courses", icon: BookOpen, path: "/dashboard" },
  { label: "Projects", icon: FolderKanban, path: "/projects" },
  { label: "Notifications", icon: Bell, path: "/notifications" },
  { label: "Leaderboard", icon: Trophy, path: "/leaderboard" },
  { label: "Profile", icon: User, path: "/profile" },
];

export default function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const displayName = user?.displayName ?? user?.username ?? "Creator";
  const avatarLetter = displayName[0]?.toUpperCase() ?? "C";

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 flex flex-col bg-sidebar/30 backdrop-blur-3xl border-r border-white/[0.03] transition-all duration-500 z-50">
      {/* Brand space */}
      <div className="px-6 py-8">
        <Logo />
      </div>

      {/* Primary Action */}
      <div className="px-4 mb-8">
        <Button 
          variant="hero" 
          className="w-full h-12 rounded-2xl justify-start px-4 gap-3 bg-gradient-cta shadow-[0_4px_15px_-5px_rgba(168,85,247,0.5)] group"
          onClick={() => navigate("/create-course")}
        >
          <Sparkles className="h-4 w-4 group-hover:scale-125 transition-transform" />
          <span className="font-bold text-sm tracking-tight">New course</span>
        </Button>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-hide">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path || (item.path === "/dashboard" && location.pathname === "/");
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "group relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                isActive 
                  ? "bg-white/[0.05] text-white shadow-inner border border-white/5" 
                  : "text-muted-foreground hover:bg-white/[0.03] hover:text-white"
              )}
            >
              <item.icon className={cn(
                "h-[18px] w-[18px] transition-colors",
                isActive ? "text-accent" : "text-muted-foreground group-hover:text-white"
              )} />
              <span className="tracking-tight">{item.label}</span>
              
              {isActive && (
                <span className="absolute right-4 h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer / User Profile */}
      <div className="p-4 border-t border-white/[0.03] bg-background/20">
        <div className="flex items-center gap-3 p-2 rounded-2xl transition-colors hover:bg-white/5 group cursor-pointer">
          <div className="relative">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-cta flex items-center justify-center font-bold text-white text-xs group-hover:ring-4 ring-primary/10 transition-all">
              {avatarLetter}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#0B0B0F]" />
          </div>
          
          <div className="flex-1 min-w-0 pr-2">
            <p className="truncate text-sm font-bold text-white leading-tight">{displayName}</p>
            <p className="truncate text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-0.5">Pro workspace</p>
          </div>
          
          <button className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-white/10 hover:text-white transition-all">
             <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
