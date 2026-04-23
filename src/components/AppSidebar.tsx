import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FolderOpen, Trophy, Plus, FileText, ChevronUp, Sun, Moon, User, LogOut, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/auth/AuthContext";
import { fetchCourses } from "@/services/courseApi";
import { useFeature } from "@/hooks/useFeature";
import GlobalSearch from "@/components/GlobalSearch";
import { createProject, getMyProjects, type Project } from "@/services/projectApi";
import { toast } from "sonner";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: FolderOpen, label: "All Projects", path: "/projects" },
  { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
];

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [creatingProject, setCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const adminPanel = useFeature("ADMIN_PANEL");

  useEffect(() => {
    let mounted = true;
    async function loadCourses() {
      try {
        const list = await fetchCourses();
        if (mounted) setCourses(list);
      } catch {
        if (mounted) setCourses([]);
      }
    }
    loadCourses();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadProjects() {
      try {
        setProjectsLoading(true);
        const list = await getMyProjects();
        if (mounted) setProjects(list);
      } catch {
        if (mounted) setProjects([]);
      } finally {
        if (mounted) setProjectsLoading(false);
      }
    }
    loadProjects();
    return () => { mounted = false; };
  }, []);

  const displayName = user?.displayName ?? user?.username ?? "User";
  const avatarLetter = displayName[0]?.toUpperCase() ?? "U";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCreateProject = async () => {
    const name = newProjectName.trim();
    if (!name) {
      toast.error("Project name is required");
      return;
    }

    try {
      setCreatingProject(true);
      const created = await createProject({
        name,
        description: newProjectDescription.trim() || undefined,
      });
      setProjects((prev) => [created, ...prev]);
      setProjectDialogOpen(false);
      setNewProjectName("");
      setNewProjectDescription("");
      toast.success("Project created");
      navigate(`/projects/${created.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create project");
    } finally {
      setCreatingProject(false);
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-sidebar transition-colors duration-300">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
          <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-display text-lg font-bold text-foreground">AI CourseGen</span>
      </div>

      {/* New Project Button */}
      <div className="px-3 pb-3">
        <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Create a personal project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">What are you working on?</label>
                <Input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Name your project"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">What are you trying to achieve?</label>
                <Textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Describe your project, goals, subject, etc..."
                  className="min-h-[120px]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setProjectDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateProject} disabled={creatingProject}>
                  {creatingProject ? "Creating..." : "Create project"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="px-3 pb-4">
        <GlobalSearch />
      </div>

      {/* Nav */}
      <nav className="space-y-1 px-3">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              location.pathname === item.path
                ? "bg-primary/15 text-primary shadow-sm"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
        {!adminPanel.loading && adminPanel.allowed && (
          <Link
            to="/admin/llm"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              location.pathname === "/admin/llm"
                ? "bg-primary/15 text-primary shadow-sm"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Bot className="h-4 w-4" />
            LLM Admin
          </Link>
        )}
      </nav>

      {/* Projects */}
      <div className="mt-6 flex-1 overflow-y-auto px-3">
        <div className="mb-2 flex items-center justify-between px-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Projects</span>
          <button
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setProjectDialogOpen(true)}
            aria-label="Create project"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-0.5">
          {projectsLoading ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">No projects yet</div>
          ) : (
            projects.slice(0, 8).map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  location.pathname === `/projects/${p.id}`
                    ? "bg-primary/15 text-primary border-l-2 border-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <span className="truncate">{p.name}</span>
              </Link>
            ))
          )}
        </div>

        <div className="mt-6 mb-2 flex items-center px-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">My Courses</span>
        </div>
        <div className="space-y-0.5">
          {courses.slice(0, 8).map((c) => (
            <Link
              key={c.id}
              to={`/courses/${c.id}`}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                location.pathname === `/courses/${c.id}`
                  ? "bg-primary/15 text-primary border-l-2 border-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate">{c.title || c.topic || "Untitled Course"}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-3 space-y-1">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent transition-all duration-200"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-primary" />
          ) : (
            <Moon className="h-4 w-4 text-primary" />
          )}
          <span className="font-medium text-foreground">
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </span>
        </button>

        {/* User section */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-xs font-bold text-primary-foreground">
              {avatarLetter}
            </div>
            <span className="font-medium text-foreground flex-1 text-left truncate">{displayName}</span>
            <ChevronUp className={cn("h-4 w-4 text-muted-foreground transition-transform", !userMenuOpen && "rotate-180")} />
          </button>

          {/* User menu dropdown */}
          {userMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border border-border bg-popover p-1 shadow-lg">
              <Link
                to="/profile"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent/70 transition-colors"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                View Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
