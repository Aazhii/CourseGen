import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  BarChart3,
  Trash2,
  Sparkles,
  Trophy,
  Users,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Clock,
  ArrowRight
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCourses, deleteCourse, updateCourse } from "@/services/courseApi";
import { getMyRank } from "@/services/leaderboardApi";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Course } from "@/types/course";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: () => fetchCourses(),
  });

  const { data: rankData } = useQuery({
    queryKey: ["leaderboard", "me"],
    queryFn: () => getMyRank().then(res => "rank" in res ? res : JSON.parse(res)),
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

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Welcome Header */}
      <div>
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Welcome back</p>
        <h1 className="mt-1 font-display text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
          Let’s build something <span className="text-gradient">remarkable</span> today.
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-8">
        <StatCard label="Courses created" value={String(rankData?.courseCount || courses.length || 0)} delta="Lifetime" type="primary" />
        <StatCard label="Total points" value={String(rankData?.totalPoints || 0)} delta={rankData?.weeklyPoints ? `+${rankData.weeklyPoints} this week` : "Active"} type="accent" />
        <StatCard label="Current Streak" value={rankData?.currentStreak ? `${rankData.currentStreak} days` : "0 days"} delta="Keep going!" />
        <StatCard label="Global Rank" value={rankData?.rank ? `#${rankData.rank}` : "Unranked"} delta="Leaderboard" icon={<Trophy className="h-3 w-3 text-yellow-500" />} />
      </div>

      {/* Continue Learning / Courses */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">Continue learning</h2>
            <p className="text-sm text-muted-foreground mt-1 font-medium">Pick up where you left off</p>
          </div>
          <Link to="/courses" className="text-sm font-bold text-primary hover:text-primary-foreground transition-colors flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[320px] rounded-2xl animate-pulse bg-white/5 border border-white/5" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="glass-strong rounded-3xl p-16 text-center border-white/5">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No courses yet</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mb-8">Start your journey by generating your first AI-powered course.</p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/create-course">Generate first course</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 3).map((course: Course, i: number) => (
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
      </section>

      {/* Bottom Layout: Activity & AI Coach */}
      <section className="grid gap-6 lg:grid-cols-3 pb-10">
        <div className="lg:col-span-2 glass-strong rounded-3xl p-8 border-white/5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div>
              <h2 className="font-display text-2xl font-bold text-white tracking-tight">Recent activity</h2>
              <p className="text-sm text-muted-foreground mt-0.5 font-medium">Latest movement across your workspace</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground cursor-pointer hover:text-white transition-colors">
              <Clock className="h-4 w-4" />
            </div>
          </div>

          <ul className="space-y-1 relative z-10">
            {ACTIVITY.map((a, i) => (
              <li key={i} className="flex items-center gap-4 py-4 px-2 rounded-xl hover:bg-white/[0.02] transition-colors border-b border-white/[0.03] last:border-0 group/item">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.04] border border-white/5 group-hover/item:bg-primary/10 group-hover/item:border-primary/20 transition-all duration-300">
                  <a.icon className="h-4 w-4 text-accent" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-200 group-hover/item:text-white transition-colors">{a.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{a.time}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-white/0 group-hover/item:text-white/20 transition-all -translate-x-2 group-hover/item:translate-x-0" />
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-strong rounded-3xl p-8 border-white/5 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 p-4">
            <Sparkles className="h-6 w-6 text-primary/10" />
          </div>

          <h2 className="font-display text-2xl font-bold text-white tracking-tight mb-1">AI Coach</h2>
          <p className="text-sm text-muted-foreground font-medium mb-8">Ask anything about your courses</p>

          <div className="space-y-4 flex-1">
            <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4 hover:border-white/10 transition-colors">
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5">Suggestion</p>
              <p className="text-sm text-gray-300 leading-relaxed">Add a 5-question quiz to <span className="text-white font-bold">Module 2</span> to lift retention by <span className="text-accent font-bold">18%</span>.</p>
            </div>
            <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4 hover:border-white/10 transition-colors">
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5">Learning Tip</p>
              <p className="text-sm text-gray-300 leading-relaxed">Two learners are stuck on <span className="text-white font-bold">Lesson 3.4</span> — consider a short walkthrough.</p>
            </div>
          </div>

          <Button variant="neon" size="xl" className="mt-8 w-full border-white/10 group">
            Open AI Coach <Sparkles className="h-4 w-4 ml-2 group-hover:animate-pulse" />
          </Button>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, delta, type = "default", icon }: { label: string; value: string; delta: string; type?: "default" | "primary" | "accent"; icon?: React.ReactNode }) {
  return (
    <div className="glass-strong rounded-2xl p-6 border-white/5 relative overflow-hidden group hover:border-white/10 transition-all duration-300">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-brand opacity-0 group-hover:opacity-5 blur-2xl transition-opacity" />
      <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground">{label}</div>
      <div className="mt-4 flex items-baseline justify-between">
        <div className="font-display text-4xl font-bold text-white tracking-tighter">{value}</div>
        <div className={cn(
          "text-[10px] font-bold px-2 py-1 rounded-lg border flex items-center gap-1",
          type === "primary" ? "text-primary border-primary/20 bg-primary/5" :
            type === "accent" ? "text-accent border-accent/20 bg-accent/5" :
              "text-muted-foreground border-white/10 bg-white/5"
        )}>
          {icon} {delta}
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course, index, onDelete, onToggleActive, togglingId }: {
  course: Course,
  index: number,
  onDelete: (id: string, t: string) => void,
  onToggleActive: (c: Course) => void,
  togglingId: string | null
}) {
  // Cycle through some nice gradients for fallback placeholders
  const gradients = [
    "from-purple-500/80 to-blue-500/80",
    "from-cyan-500/80 to-teal-500/80",
    "from-pink-500/80 to-violet-500/80"
  ];
  const accent = gradients[index % gradients.length];
  const progress = course.progress || (index === 0 ? 64 : index === 1 ? 28 : 91); // Match fallback image stats
  const tag = index === 0 ? "INTERVIEW PREP" : index === 1 ? "TEAM ONBOARDING" : "PERSONAL LEARNING";

  return (
    <article className="group relative overflow-hidden rounded-3xl glass-strong border-white/5 p-6 transition-all duration-500 hover:border-white/20 hover:shadow-glow hover:-translate-y-1">
      <div className={cn("h-40 w-full rounded-2xl bg-gradient-to-br relative overflow-hidden shadow-inner", accent)}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_60%)]" />
        <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay" />
        <div className="absolute bottom-4 right-4 h-10 w-10 rounded-full glass border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
          <ArrowRight className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 flex items-start justify-between gap-4">
        <h3 className="font-display text-xl font-bold text-white leading-tight flex-1">{course.title || "Untitled Course"}</h3>
        <span className="shrink-0 rounded-full border border-white/5 bg-white/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
          {tag}
        </span>
      </div>

      <div className="mt-3 text-xs font-medium text-muted-foreground flex items-center gap-2">
        {course.modules?.length || 8} modules
        <span className="h-1 w-1 rounded-full bg-white/10" />
        AI Generated
      </div>

      <div className="mt-6 relative">
        <div className="flex items-center justify-between text-[11px] mb-2">
          <span className="text-muted-foreground font-bold">{progress}% COMPLETE</span>
          <button
            className="text-white/20 hover:text-destructive transition-colors"
            onClick={(e) => {
              e.preventDefault();
              onDelete(course.id, course.title);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/5 border border-white/5">
          <div
            className="h-full rounded-full bg-gradient-cta shadow-[0_0_12px_rgba(168,85,247,0.4)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-2 pt-2">
        <Link to={`/courses/${course.id}`} className="flex-1">
          <Button variant="glass" className="w-full text-xs h-10 font-bold border-white/5 hover:border-white/10">
            VIEW COURSE
          </Button>
        </Link>
        <Button
          variant="glass"
          size="icon"
          className="h-10 w-10 border-white/5 text-muted-foreground"
          onClick={() => onToggleActive(course)}
          disabled={togglingId === course.id}
        >
          {course.active === false ? <ToggleLeft className="h-5 w-5" /> : <ToggleRight className="h-5 w-5 text-accent" />}
        </Button>
      </div>
    </article>
  );
}

const ACTIVITY = [
  { icon: Sparkles, text: "Generated “Intro to Vector Databases” course", time: "2 minutes ago" },
  { icon: Users, text: "Priya joined the Engineering Onboarding project", time: "1 hour ago" },
  { icon: BookOpen, text: "Module 3 of System Design completed by 12 learners", time: "3 hours ago" },
  { icon: Trophy, text: "You moved up to #2 on the weekly leaderboard", time: "Yesterday" },
];
