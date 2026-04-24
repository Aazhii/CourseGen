import { Navigate, Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { useAuth } from "@/auth/AuthContext";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Search, Bell, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

export default function AppLayout() {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-2xl border-4 border-primary/30 border-t-primary animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Syncing environment...</p>
      </div>
    </div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-full bg-background font-body text-foreground selection:bg-primary/20 overflow-hidden">
      <AmbientBackground />
      
      {/* Background layers from MD */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-aurora opacity-50" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>
      
      {/* Premium Sidebar Wrapper */}
      <div className="hidden lg:block w-72 shrink-0 h-full relative z-50">
        <AppSidebar />
      </div>

      <div className="flex flex-1 flex-col min-w-0 h-full relative z-10 transition-all duration-500">
        {/* Sticky Professional Topbar */}
        <header className="sticky top-0 z-40 flex h-20 shrink-0 items-center justify-between border-b border-white/[0.03] bg-background/30 px-8 backdrop-blur-2xl">
          <div className="relative w-full max-w-lg group">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-white" />
            <input
              type="text"
              placeholder="Search courses, projects, prompts..."
              className="h-11 w-full rounded-2xl border border-white/5 bg-white/[0.03] pl-11 pr-16 text-sm font-medium outline-none placeholder:text-muted-foreground/60 transition-all focus:border-white/10 focus:bg-white/[0.05] focus:ring-4 focus:ring-primary/5"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold text-muted-foreground sm:inline-block">
              ⌘ K
            </kbd>
          </div>
          
          <div className="flex items-center gap-5">
            <button className="relative rounded-full p-2.5 text-muted-foreground hover:bg-white/5 hover:text-white transition-all group">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(168,85,247,0.7)] border-2 border-[#0B0B0F]" />
              <div className="absolute top-full right-0 mt-2 bg-popover border border-white/5 p-2 rounded-xl text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest font-bold">Notifications</div>
            </button>
            
            <div className="h-8 w-[1px] bg-white/5 mx-1" />
            
            <Button variant="hero" size="sm" className="h-10 px-5 group">
              <Sparkles className="mr-2 h-4 w-4 group-hover:scale-125 transition-transform" />
              Generate
            </Button>
          </div>
        </header>

        {/* Unified Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
           <div className="mx-auto max-w-7xl px-8 py-10 md:px-12">
              <Outlet />
           </div>
        </div>
      </div>
    </div>
  );
}
