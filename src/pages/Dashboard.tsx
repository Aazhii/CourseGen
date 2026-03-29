import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Bell, Trash2, BarChart3, BookOpen, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationPanel from "@/components/NotificationPanel";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import {
  fetchCourses,
  fetchCoursesSharedByMe,
  deleteCourse,
  activateCourse,
  deactivateCourse,
} from "@/services/courseApi";
import { fetchSharedWithMeInvites } from "@/services/inviteApi";
import { toast } from "sonner";

const tabs = ["My Courses", "Shared With Me", "Shared By Me"];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("My Courses");
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<"All" | "Invites" | "Achievements">("All");
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function loadCourses() {
      setLoading(true);
      try {
        let list: any[] = [];

        if (activeTab === "Shared By Me") {
          list = await fetchCoursesSharedByMe();
        } else if (activeTab === "Shared With Me") {
          // fetchSharedWithMeInvites returns invite objects; normalise to course-like shape
          const invites = await fetchSharedWithMeInvites();
          list = Array.isArray(invites)
            ? invites.map((inv: any) => ({
              id: inv.courseId ?? inv.id,
              title: inv.courseName ?? inv.courseTitle ?? inv.title ?? "Untitled Course",
              description: inv.courseDescription ?? inv.description ?? "No description available.",
              modules: Array.from({ length: inv.moduleCount ?? 0 }),
              lessonCount: inv.lessonCount ?? 0,
              active: true,
              isEnrolled: true,
              inviteStatus: inv.inviteStatus ?? inv.status,
            }))
            : [];
        } else {
          list = await fetchCourses();
        }

        if (mounted) setCourses(list);
      } catch (error) {
        console.error("Failed to load courses:", error);
        if (mounted) setCourses([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCourses();
    return () => {
      mounted = false;
    };
  }, [activeTab]);

  const handleDelete = (courseId: string, courseTitle: string) => {
    toast(`Delete "${courseTitle}"?`, {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deleteCourse(courseId);
            setCourses((prev) => prev.filter((c) => c.id !== courseId));
            toast.success("Course deleted");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete");
          }
        },
      },
    });
  };

  const handleToggleActive = async (course: any) => {
    const id = course.id;
    setTogglingId(id);
    try {
      if (course.active) {
        await deactivateCourse(id);
        toast.success("Course deactivated");
      } else {
        await activateCourse(id);
        toast.success("Course activated");
      }
      setCourses((prev) =>
        prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to toggle status");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="gradient-header px-8 pb-8 pt-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Courses Dashboard</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">Manage courses you've created or enrolled in.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/create-course">
                <Button variant="gradient" className="gap-2 shadow-lg">
                  <Plus className="h-4 w-4" />
                  Create New Course
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-foreground"
                onClick={() => setPanelOpen(true)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-1 rounded-lg bg-secondary/50 p-1 w-fit">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium transition-all duration-200",
                  activeTab === tab
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="p-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-xl h-52 animate-pulse bg-secondary/40" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-foreground">No courses found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeTab === "My Courses" ? "Create your first course to get started." : "Nothing to show here yet."}
            </p>
            {activeTab === "My Courses" && (
              <Link to="/create-course" className="mt-4">
                <Button variant="gradient" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Course
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 p-8 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course, i) => (
              <div
                key={course.id || `${i}`}
                className={cn(
                  "glass-card group flex flex-col rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
                  course.active === false && "opacity-70"
                )}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Card accent bar */}
                <div className={cn("h-1 w-full", course.active === false ? "bg-muted" : "gradient-primary")} />
                <div className="flex flex-col p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display text-base font-bold text-foreground capitalize truncate">
                          {course.title || course.courseName || course.topic || "Untitled Course"}
                        </h3>
                        {course.active === false && (
                          <span className="text-xs font-medium text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                            Deactivated
                          </span>
                        )}
                      </div>
                    </div>
                    {activeTab === "My Courses" && (
                      <button
                        className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive ml-2 shrink-0"
                        onClick={() => handleDelete(course.id, course.title)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {course.description || "No description available."}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <BarChart3 className="h-3.5 w-3.5" />
                      <span>{Array.isArray(course.modules) ? course.modules.length : 0} Modules</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>{course.totalLessons ?? course.lessonCount ?? 0} Lessons</span>
                    </div>
                  </div>
                  <div className="mt-5 flex gap-2">
                    <Link to={`/courses/${course.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                      >
                        View Course
                      </Button>
                    </Link>
                    {activeTab === "My Courses" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={() => handleToggleActive(course)}
                        disabled={togglingId === course.id}
                        title={course.active === false ? "Activate" : "Deactivate"}
                      >
                        {course.active === false ? (
                          <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ToggleRight className="h-5 w-5 text-primary" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <NotificationPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        activeTab={panelTab}
        onTabChange={setPanelTab}
      />
    </>
  );
}
