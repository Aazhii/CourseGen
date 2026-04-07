import { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { ChevronLeft, CheckCircle, BookOpen, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import LessonContentRenderer from "@/components/lesson/LessonContentRenderer";
import { LessonData } from "@/types/lessonContent";
import { getLessonWithGeneration } from "@/services/lessonService";
import { getCourseById } from "@/services/courseApi";
import { markLessonComplete, markLessonIncomplete, startLessonSession, stopLessonSession } from "@/services/progressApi";
import { toast } from "sonner";

export default function LessonView() {
  const { courseId, lessonId } = useParams();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [courseTitle, setCourseTitle] = useState("Course");
  const [completed, setCompleted] = useState(false);

  const moduleIdFromQuery =
    new URLSearchParams(location.search).get("moduleId") || undefined;

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!courseId || !lessonId) {
        if (mounted) setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const course = await getCourseById(courseId);
        if (mounted) {
          setCourseTitle(course?.title || course?.topic || "Course");
        }

        const normalized = await getLessonWithGeneration({
          courseId,
          lessonId,
          moduleId: moduleIdFromQuery,
        });

        if (mounted) {
          setLesson(normalized);
          setCompleted(Boolean((normalized as any)?.completed));
        }
      } catch (error) {
        console.error("Failed to load lesson:", error);
        if (mounted) {
          setLesson(null);
          toast.error(error instanceof Error ? error.message : "Failed to load lesson");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    // Start session when lesson and course are both available
    if (courseId && lessonId) {
      startLessonSession(lessonId, courseId).catch(console.error);
    }

    return () => {
      mounted = false;
      // Stop session when user leaves
      if (courseId && lessonId) {
        stopLessonSession(lessonId, courseId).catch(console.error);
      }
    };
  }, [courseId, lessonId, moduleIdFromQuery]);

  // Track visibility change to handle tab switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!courseId || !lessonId) return;
      if (document.visibilityState === 'visible') {
        startLessonSession(lessonId, courseId).catch(console.error);
      } else {
        stopLessonSession(lessonId, courseId).catch(console.error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [courseId, lessonId]);



  const onToggleComplete = async () => {
    if (!lessonId || !courseId) return;
    try {
      if (completed) {
        await markLessonIncomplete(lessonId, courseId);
        setCompleted(false);
        toast.success("Marked as incomplete");
      } else {
        await markLessonComplete(lessonId, courseId);
        setCompleted(true);
        toast.success("Marked as complete");
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update progress");
    }
  };

  if (loading) {
    return <div className="p-8 text-muted-foreground">Loading lesson...</div>;
  }

  if (!lesson) {
    return <div className="p-8 text-muted-foreground">Lesson not found.</div>;
  }

  return (
    <div className="animate-fade-in min-h-screen">
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md px-6 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link to={`/courses/${courseId}`}>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />
              Back to Course
            </Button>
          </Link>
          <Button
            variant={completed ? "outline" : "default"}
            size="sm"
            className="gap-2"
            onClick={onToggleComplete}
          >
            <CheckCircle className="h-4 w-4" />
            {completed ? "Completed ✓" : "Mark Complete"}
          </Button>
          <Link to={`/courses/${courseId}/lessons/${lessonId}/coach`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Sparkles className="h-4 w-4" />
              AI Coach
            </Button>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 pt-10 pb-6">
        <div className="mb-4 flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            {courseTitle}
          </span>
          <span className="text-border">•</span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            Live lesson
          </span>
        </div>

        <h1 className="font-display text-3xl font-bold text-foreground leading-tight tracking-tight">
          {lesson.title}
        </h1>

        <div className="mt-6 h-px bg-border" />
      </div>

      <div className="mx-auto max-w-4xl px-6 pb-20">
        {lesson.content.length > 0 ? (
          <LessonContentRenderer blocks={lesson.content} courseId={courseId} lessonId={lessonId} />
        ) : (
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            Lesson content is not available yet.
          </div>
        )}

        <div className="mt-16 flex justify-center border-t border-border pt-10">
          <Button
            variant={completed ? "outline" : "success"}
            size="lg"
            className="gap-2 px-12"
            onClick={onToggleComplete}
          >
            <CheckCircle className="h-5 w-5" />
            {completed ? "Completed ✓" : "Mark as Complete"}
          </Button>
        </div>
      </div>
    </div>
  );
}