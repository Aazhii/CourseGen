import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Trash2 } from "lucide-react";
import { projects } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Projects() {
  const [search, setSearch] = useState("");
  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-foreground">Projects</h1>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          New project
        </Button>
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

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project, i) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="glass-card group rounded-xl p-6 transition-all hover:border-primary/30"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start justify-between">
              <h3 className="font-display text-lg font-bold text-foreground">{project.name}</h3>
              <button className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {project.description && (
              <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">Updated {project.updatedAt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
