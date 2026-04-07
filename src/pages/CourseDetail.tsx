import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Share2, Trash2, Play, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { deleteCourse, getCourseById } from "@/services/courseApi";
import { toast } from "sonner";

export default function CourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadCourse() {
      if (!courseId) return;
      setLoading(true);
      try {
        const data = await getCourseById(courseId);
        if (mounted) setCourse(data);
      } catch (error) {
        console.error("Failed to load course:", error);
        if (mounted) setCourse(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCourse();
    return () => {
      mounted = false;
    };
  }, [courseId]);

  const modules = useMemo(() => (Array.isArray(course?.modules) ? course.modules : []), [course]);

  const handleDelete = async () => {
    if (!courseId) return;
    try {
      await deleteCourse(courseId);
      toast.success("Course deleted");
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to delete course:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete course");
    }
  };

  if (loading) {
    return <div className="p-8 text-muted-foreground">Loading course...</div>;
  }

  if (!course) {
    return <div className="p-8 text-muted-foreground">Course not found.</div>;
  }

  const totalLessons = course.totalLessons ?? course.lessonCount ?? modules.reduce((sum: number, module: any) => sum + (Array.isArray(module?.lessons) ? module.lessons.length : 0), 0);
  const completedLessons = course.completedLessons ?? 0;

  const progress = totalLessons > 0
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  return (
    <div className="animate-fade-in p-8">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link to="/">
          <Button variant="outline" size="sm" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Link to={`/courses/${course.id || courseId}/coach`}>
            <Button variant="default" className="gap-2">
              <Sparkles className="h-4 w-4" />
              AI Coach
            </Button>
          </Link>
          <Link to={`/courses/${course.id || courseId}/share`}>
            <Button variant="ghost" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share Course
            </Button>
          </Link>
          <Button variant="outline-destructive" className="gap-2" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            Delete Course
          </Button>
        </div>
      </div>

      {/* Course Info */}
      <div className="mt-8">
        <div className="h-3 w-3 rounded-full bg-muted-foreground" />
        <h1 className="mt-4 font-display text-4xl font-bold text-foreground">{course.title || course.topic || "Untitled Course"}</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground leading-relaxed">
          Topic: {course.description || course.topic || "No description"}
        </p>

        {/* Progress */}
        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Course Progress</span>
          <span className="text-sm font-medium text-primary">
            {progress}% ({completedLessons} / {totalLessons})
          </span>
        </div>
        <Progress value={progress} className="mt-2 h-2" />
      </div>

      <div className="mt-8 border-t border-border pt-8">
        <h2 className="font-display text-2xl font-bold text-foreground">Course Modules</h2>

        <div className="mt-6 space-y-4">
          {modules.map((module: any) => (
            <div key={module.id} className="glass-card rounded-xl overflow-hidden">
              {/* Module header */}
              <div className="flex items-center gap-4 p-5 border-b border-border/50">
                <span className="rounded-md gradient-primary px-3 py-1 text-xs font-bold text-primary-foreground uppercase tracking-wider">
                  Module {module.number || module.moduleNumber || "-"}
                </span>
                <h3 className="font-display font-semibold text-foreground">{module.title || module.name || "Untitled Module"}</h3>
              </div>

              {/* Lessons */}
              <div className="divide-y divide-border/30">
                {(Array.isArray(module.lessons) ? module.lessons : []).map((lesson: any) => (
                  <div key={lesson.id} className="flex items-center justify-between px-6 py-4 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {lesson.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <div className="h-5 w-5 rounded border border-border" />
                      )}
                      <span className="text-sm text-foreground">{lesson.title || lesson.name || "Untitled Lesson"}</span>
                    </div>
                    <Link to={`/courses/${course.id || courseId}/lessons/${lesson.id}?moduleId=${module.id}`}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Play className="h-3 w-3" />
                        Start
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
