import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Trash2 } from "lucide-react";
import { projects } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ProjectDetail() {
  const { projectId } = useParams();
  const project = projects.find((p) => p.id === projectId);

  if (!project) return <div className="p-8 text-muted-foreground">Project not found.</div>;

  return (
    <div className="animate-fade-in p-8">
      <Link to="/projects">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <ChevronLeft className="h-4 w-4" />
          All projects
        </Button>
      </Link>

      <div className="mt-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">{project.name}</h1>
        <Button variant="outline-destructive" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Delete project
        </Button>
      </div>

      <div className="mx-auto mt-8 max-w-3xl">
        <div className="glass-card rounded-xl p-6">
          <Textarea
            placeholder="Generate a new course..."
            className="min-h-[80px] bg-secondary/50 border-border"
          />
          <div className="mt-3 flex items-center justify-between">
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <span className="text-xl">+</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">AI CourseGen v1</span>
              <Button size="icon" variant="secondary">▶</Button>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-muted-foreground">
          No courses generated yet. Type a topic above to begin.
        </p>
      </div>
    </div>
  );
}
