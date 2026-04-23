import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FolderOpen, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { createProject, deleteProject, getMyProjects, type Project } from "@/services/projectApi";
import { toast } from "sonner";

function formatRelative(dateLike?: string) {
  if (!dateLike) return "Recently";
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "Recently";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

export default function Projects() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProjects() {
      try {
        setLoading(true);
        const list = await getMyProjects();
        if (mounted) setProjects(list);
      } catch (e) {
        if (mounted) setProjects([]);
        toast.error(e instanceof Error ? e.message : "Failed to load projects");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProjects();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return true;
        return (
          p.name.toLowerCase().includes(keyword) ||
          (p.description || "").toLowerCase().includes(keyword)
        );
      }),
    [projects, search],
  );

  const handleCreateProject = async () => {
    const name = newName.trim();
    if (!name) {
      toast.error("Project name is required");
      return;
    }

    try {
      setCreating(true);
      const created = await createProject({
        name,
        description: newDescription.trim() || undefined,
      });
      setProjects((prev) => [created, ...prev]);
      setProjectDialogOpen(false);
      setNewName("");
      setNewDescription("");
      toast.success("Project created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = (project: Project) => {
    toast(`Delete \"${project.name}\"?`, {
      description: "Courses will be unlinked, not deleted.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deleteProject(project.id, false);
            setProjects((prev) => prev.filter((p) => p.id !== project.id));
            toast.success("Project deleted");
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to delete project");
          }
        },
      },
    });
  };

  return (
    <div className="animate-fade-in p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">Projects</h1>
        <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              New project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a project</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Project name"
              />
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Optional description"
                className="min-h-[100px]"
              />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setProjectDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateProject} disabled={creating}>
                  {creating ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <span className="text-sm text-muted-foreground">Sort by</span>
        <Button variant="secondary" size="sm">Activity</Button>
      </div>

      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-xl bg-secondary/40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-border p-10 text-center">
          <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium text-foreground">No projects found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a project to group related course prompts and generated courses.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, i) => (
            <div
              key={project.id}
              className="glass-card group rounded-xl p-6 transition-all hover:border-primary/30"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between gap-2">
                <Link to={`/projects/${project.id}`} className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-bold text-foreground truncate">{project.name}</h3>
                </Link>
                <button
                  onClick={() => handleDeleteProject(project)}
                  className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                  aria-label={`Delete ${project.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {project.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{project.description}</p>
              )}
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{project.courses.length} course{project.courses.length === 1 ? "" : "s"}</span>
                <span>Updated {formatRelative(project.updatedAt || project.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
