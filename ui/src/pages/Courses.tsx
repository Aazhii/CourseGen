import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Search, Filter, ArrowRight, Loader2, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchCourses, deleteCourse, updateCourse } from "@/services/courseApi";
import { CourseCard } from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Course } from "@/types/course";

export default function Courses() {
  const queryClient = useQueryClient();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: courses = [], isLoading, isError } = useQuery({
    queryKey: ["courses"],
    queryFn: () => fetchCourses(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course deleted successfully");
    },
    onError: () => toast.error("Failed to delete course"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updateCourse(id, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course status updated");
    },
    onSettled: () => setTogglingId(null),
  });

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (course: Course) => {
    setTogglingId(course.id);
    toggleActiveMutation.mutate({ id: course.id, active: !course.active });
  };

  const filteredCourses = courses.filter((c: Course) => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl animate-fade-in">
      {/* Header */}
      <div className="gradient-header px-8 pb-8 pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">My Courses</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">Manage and track your AI-generated learning paths.</p>
            </div>
          </div>

          <Button variant="hero" asChild className="w-full md:w-auto">
            <Link to="/create-course" className="gap-2">
              <Plus className="h-4 w-4" />
              Build New Course
            </Link>
          </Button>
        </div>

        {/* Toolbar */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search courses..." 
              className="pl-10 h-11 bg-background/50 border-border/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-11 gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <div className="p-8">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[320px] rounded-3xl animate-pulse bg-muted border border-border" />
            ))}
          </div>
        ) : isError ? (
          <div className="glass-card rounded-3xl p-16 text-center">
             <h3 className="text-xl font-bold text-foreground mb-2">Something went wrong</h3>
             <p className="text-muted-foreground mb-6">Failed to load your courses. Please try again later.</p>
             <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["courses"] })}>Retry</Button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="glass-card rounded-3xl p-16 text-center">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No results found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              {searchQuery ? `No courses matching "${searchQuery}"` : "You haven't generated any courses yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-10">
            {filteredCourses.map((course: Course, i: number) => (
              <CourseCard
                key={course.id}
                course={course}
                index={i}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
                togglingId={togglingId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
