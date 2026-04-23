import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { BookOpen, ChevronLeft, Play, Save, Trash2, Library, Sparkles, Wand2, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createCourse } from "@/services/courseApi";
import { addCourseToProject, deleteProject, getProjectById, removeCourseFromProject, listProjectPrompts, saveProjectPrompt, deleteProjectPrompt, markPromptUsed, type Project, type ProjectPrompt } from "@/services/projectApi";
import { toast } from "sonner";

function formatRelative(dateLike?: string) {
  if (!dateLike) return "recently";
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "recently";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Prompts State
  const [composerPrompt, setComposerPrompt] = useState("");
  const [savedPrompts, setSavedPrompts] = useState<ProjectPrompt[]>([]);
  
  const [generating, setGenerating] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  const [unlinkingCourseId, setUnlinkingCourseId] = useState<string | null>(null);

  const trimmedPrompt = useMemo(() => composerPrompt.trim(), [composerPrompt]);

  useEffect(() => {
    if (!projectId) return;

    let mounted = true;
    async function loadProject() {
      try {
        setLoading(true);
        const [found, prompts] = await Promise.all([
          getProjectById(projectId!),
          listProjectPrompts(projectId!)
        ]);
        if (!mounted) return;
        setProject(found);
        setSavedPrompts(prompts);
      } catch (e) {
        if (mounted) setProject(null);
        toast.error(e instanceof Error ? e.message : "Failed to load project");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProject();
    return () => {
      mounted = false;
    };
  }, [projectId]);

  const refreshProject = async () => {
    if (!projectId) return;
    const found = await getProjectById(projectId);
    setProject(found);
  };

  const refreshPrompts = async () => {
    if (!projectId) return;
    const prompts = await listProjectPrompts(projectId);
    setSavedPrompts(prompts);
  };

  const handleGenerateCourse = async () => {
    if (!project || !projectId) return;
    if (!trimmedPrompt) {
      toast.error("Write a prompt first");
      return;
    }

    try {
      setGenerating(true);
      toast.loading("Generating course...", { id: "project-generate" });
      
      const createdCourse = await createCourse({
        topic: trimmedPrompt,
        difficulty: "Beginner",
        duration: "2 Hours",
      });
      
      await addCourseToProject(project.id, createdCourse.id);
      
      // Save prompt to backend
      await saveProjectPrompt(projectId, {
        text: trimmedPrompt,
        relatedCourseId: createdCourse.id,
        relatedCourseTitle: createdCourse.title,
      });
      
      await refreshPrompts();
      setComposerPrompt("");
      await refreshProject();
      
      toast.success("Course generated and linked to project", { id: "project-generate" });
      navigate(`/courses/${createdCourse.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed", { id: "project-generate" });
    } finally {
      setGenerating(false);
    }
  };

  const handleSavePrompt = async () => {
    if (!projectId) return;
    if (!trimmedPrompt) {
      toast.error("Prompt cannot be empty");
      return;
    }
    try {
      await saveProjectPrompt(projectId, { text: trimmedPrompt });
      await refreshPrompts();
      toast.success("Prompt saved to this project");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save prompt");
    }
  };

  const handleUseSavedPrompt = async (prompt: ProjectPrompt) => {
    if (!projectId) return;
    setComposerPrompt(prompt.text);
    try {
      await markPromptUsed(projectId, prompt.id);
      await refreshPrompts();
    } catch {
      // ignore non-critical errs
    }
  };

  const handleDeleteSavedPrompt = async (prompt: ProjectPrompt) => {
    if (!projectId) return;
    try {
      await deleteProjectPrompt(projectId, prompt.id);
      await refreshPrompts();
      toast.success("Prompt deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete prompt");
    }
  };

  const handleUnlinkCourse = async (courseId: string) => {
    if (!project) return;
    try {
      setUnlinkingCourseId(courseId);
      await removeCourseFromProject(project.id, courseId);
      await refreshProject();
      toast.success("Course removed from project");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove course");
    } finally {
      setUnlinkingCourseId(null);
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    try {
      setDeletingProject(true);
      await deleteProject(project.id, false);
      toast.success("Project deleted");
      navigate("/projects");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete project");
    } finally {
      setDeletingProject(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-muted-foreground animate-pulse">
        <Sparkles className="h-10 w-10 mb-4 opacity-50" />
        Loading your project workspace...
      </div>
    );
  }

  if (!project) return <div className="p-8 text-center text-muted-foreground">Project not found.</div>;

  return (
    <div className="animate-fade-in p-6 lg:p-8 max-w-7xl mx-auto flex flex-col gap-8 min-h-[calc(100vh-4rem)]">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4">
        <div>
          <Link to="/projects" className="inline-block hover:opacity-80 transition-opacity">
            <Button variant="ghost" size="sm" className="gap-2 -ml-3 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" /> All Projects
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                <Library className="h-6 w-6" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                {project.name}
              </h1>
            </div>
            {project.description && (
              <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed mt-2 pl-14">
                {project.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground pl-14 mt-2">
              <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {project.courses.length} linked courses</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Updated {formatRelative(project.updatedAt || project.createdAt)}</span>
            </div>
          </div>
          
          <Button variant="outline-destructive" className="gap-2 shrink-0 bg-background/50 backdrop-blur" onClick={handleDeleteProject} disabled={deletingProject}>
            <Trash2 className="h-4 w-4" />
            {deletingProject ? "Deleting..." : "Delete Project"}
          </Button>
        </div>
      </div>

      {/* DASHBOARD TABS */}
      <Tabs defaultValue="courses" className="flex-1 flex flex-col mt-4">
        <TabsList className="bg-muted/50 border border-border p-1 rounded-xl w-full max-w-sm grid grid-cols-2">
          <TabsTrigger value="courses" className="rounded-lg py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            Linked Courses
          </TabsTrigger>
          <TabsTrigger value="prompts" className="rounded-lg py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            Prompt Engine
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-8 flex-1">
          
          {/* TAB: COURSES */}
          <TabsContent value="courses" className="h-full border-none p-0 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Create New Course Card */}
              <Card className="flex flex-col items-center justify-center p-8 border-dashed border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer text-center group min-h-[220px]"
                onClick={() => {
                  const tabs = document.querySelector('[data-value="prompts"]') as HTMLElement;
                  if (tabs) tabs.click();
                }}>
                <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Wand2 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">Create New Course</h3>
                <p className="text-sm text-muted-foreground">Jump to the Prompt Engine to generate a new AI course for this project.</p>
              </Card>

              {/* Render existing courses */}
              {project.courses.map((course) => (
                <Card key={course.id} className="flex flex-col relative group overflow-hidden border-border/60 hover:shadow-lg transition-all hover:border-primary/30 min-h-[220px] bg-background/60 backdrop-blur-md">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 opacity-70" />
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <Link to={`/courses/${course.id}`} className="hover:opacity-80 transition-opacity">
                      <h3 className="font-bold text-xl text-foreground line-clamp-2 leading-tight mb-2">
                        {course.title}
                      </h3>
                      {course.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {course.description}
                        </p>
                      )}
                    </Link>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-md">
                        <BookOpen className="h-3.5 w-3.5" />
                        {course.moduleCount ?? 0} Modules
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                        onClick={(e) => { e.preventDefault(); handleUnlinkCourse(course.id); }}
                        disabled={unlinkingCourseId === course.id}
                      >
                        {unlinkingCourseId === course.id ? "Removing..." : "Unlink"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB: PROMPTS */}
          <TabsContent value="prompts" className="h-full border-none p-0 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              
              {/* Creator Canvas */}
              <div className="lg:col-span-3 space-y-6">
                <div className="glass-card rounded-[24px] p-6 sm:p-8 bg-gradient-to-br from-background via-background to-secondary/20 shadow-xl border-primary/10 relative overflow-hidden">
                  <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
                  
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-foreground/90">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Course Composer
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md">
                    Describe exactly what you want to teach. The AI will generate a structured, comprehensive curriculum explicitly for this project.
                  </p>
                  
                  <Textarea
                    value={composerPrompt}
                    onChange={(e) => setComposerPrompt(e.target.value)}
                    placeholder='e.g., "A comprehensive guide to building responsive React applications with TailwindCSS, including modern hooks and state management..."'
                    className="min-h-[160px] resize-y bg-background/50 border-border shadow-inner text-base p-5 rounded-xl focus:border-primary/50 transition-colors"
                  />
                  
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Button variant="outline" className="gap-2 rounded-xl text-muted-foreground w-full sm:w-auto hover:text-foreground" onClick={handleSavePrompt}>
                      <Save className="h-4 w-4" /> Save as Template
                    </Button>
                    
                    <Button size="lg" className="gap-2 w-full sm:w-auto rounded-xl px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-semibold" onClick={handleGenerateCourse} disabled={generating}>
                      <Play className="h-4 w-4" fill="currentColor" />
                      {generating ? "Generating..." : "Generate Magic"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Saved Prompts Sidebar */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Library className="h-4 w-4 text-primary" /> Saved Prompts
                  </h3>
                  <span className="bg-secondary text-secondary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    {savedPrompts.length}
                  </span>
                </div>
                
                {savedPrompts.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground bg-secondary/30 rounded-2xl border border-dashed border-border/60">
                    <Save className="h-8 w-8 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No saved prompts in this project yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                    {savedPrompts.map((prompt) => (
                      <div key={prompt.id} className="group relative rounded-xl border border-border/80 bg-background/50 p-4 hover:border-primary/40 hover:bg-background transition-all hover:shadow-md">
                        <p className="text-sm text-foreground line-clamp-3 leading-relaxed mb-3 pr-6">
                          "{prompt.text}"
                        </p>
                        
                        {prompt.relatedCourseTitle && (
                          <div className="flex items-center gap-1.5 text-xs text-primary/80 bg-primary/10 px-2 py-1 rounded w-max mb-3">
                            <CheckCircle2 className="h-3 w-3" />
                            Created: <span className="font-medium truncate max-w-[150px]">{prompt.relatedCourseTitle}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground/70 font-medium tracking-wide flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatRelative(prompt.lastUsedAt || prompt.updatedAt)}
                          </span>
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => handleUseSavedPrompt(prompt)} title="Use this prompt">
                              <Play className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteSavedPrompt(prompt)} title="Delete prompt">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// Inline fallback Card (if standard card isn't available)
function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-2xl border bg-card text-card-foreground shadow-sm ${className}`} {...props}>
      {children}
    </div>
  )
}
