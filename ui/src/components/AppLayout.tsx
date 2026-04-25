import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import AppSidebar from "./AppSidebar";
import { useAuth } from "@/auth/AuthContext";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Search, Bell, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { resolveByPrefix, type SearchResultItem } from "@/services/searchApi";

export default function AppLayout() {
  const { token, loading } = useAuth();
  const navigate = useNavigate();
  const searchWrapRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);

  const trimmedQuery = query.trim();
  const canSearch = trimmedQuery.length >= 2;

  useEffect(() => {
    if (!canSearch) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setSearchLoading(true);
      try {
        const items = await resolveByPrefix(trimmedQuery, { limit: 6 });
        if (!cancelled) {
          setSearchResults(items);
          setSearchOpen(true);
        }
      } catch {
        if (!cancelled) {
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [canSearch, trimmedQuery]);

  useEffect(() => {
    const onOutsideClick = (event: MouseEvent) => {
      if (!searchWrapRef.current) return;
      if (!searchWrapRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  const visibleResults = useMemo(() => searchResults.slice(0, 6), [searchResults]);

  const goToResult = (result: SearchResultItem) => {
    setSearchOpen(false);
    setQuery("");

    if (result.type === "COURSE") {
      navigate(`/courses/${result.id}`);
      return;
    }

    navigate("/profile");
  };

  const onSearchSubmit = () => {
    if (visibleResults.length > 0) {
      goToResult(visibleResults[0]);
      return;
    }

    if (trimmedQuery.length > 0) {
      navigate("/projects");
      setSearchOpen(false);
    }
  };

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
          <div ref={searchWrapRef} className="relative w-full max-w-lg group">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-white" />
            <input
              type="text"
              placeholder="Search courses, projects, prompts..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSearchSubmit();
                }
                if (e.key === "Escape") {
                  setSearchOpen(false);
                }
              }}
              className="h-11 w-full rounded-2xl border border-white/5 bg-white/[0.03] pl-11 pr-16 text-sm font-medium outline-none placeholder:text-muted-foreground/60 transition-all focus:border-white/10 focus:bg-white/[0.05] focus:ring-4 focus:ring-primary/5"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold text-muted-foreground sm:inline-block">
              ⌘ K
            </kbd>

            {searchOpen && (canSearch || searchLoading) && (
              <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-white/10 bg-popover/95 shadow-2xl backdrop-blur-2xl">
                {searchLoading ? (
                  <div className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Searching...
                  </div>
                ) : visibleResults.length === 0 ? (
                  <div className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    No results
                  </div>
                ) : (
                  <ul className="max-h-72 overflow-y-auto py-1">
                    {visibleResults.map((result) => (
                      <li key={`${result.type}-${result.id}`}>
                        <button
                          type="button"
                          onClick={() => goToResult(result)}
                          className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-foreground hover:bg-white/5"
                        >
                          <span className="truncate pr-3">{result.label}</span>
                          <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {result.type}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
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
