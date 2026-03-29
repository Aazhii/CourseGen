import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCourse } from "@/services/courseApi";
import { toast } from "sonner";

export default function CreateCourse() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [duration, setDuration] = useState("2h");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleCreateCourse = async () => {
    if (!topic.trim()) {
      toast.error("Topic is required");
      return;
    }

    try {
      setSubmitting(true);
      const createdCourse = await createCourse({ topic, difficulty, duration });
      const courseId = createdCourse?.id;
      toast.success("Course created successfully");
      navigate(courseId ? `/courses/${courseId}` : "/");
    } catch (error) {
      console.error("Failed to create course:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create course");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-8 animate-fade-in">
      <div className="w-full max-w-xl glass-card rounded-2xl p-8">
        <div className="flex items-center gap-3">
          <Sparkles className="h-7 w-7 text-yellow-400" />
          <h1 className="font-display text-3xl font-bold text-foreground">Create New Course</h1>
        </div>
        <p className="mt-2 text-muted-foreground">
          Enter a topic and let AI generate a curriculum for you.
        </p>

        <div className="mt-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Topic</label>
            <Input
              placeholder="e.g. Introduction to Python, Advanced React Patterns..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Difficulty</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Duration</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="2h">2 Hours</SelectItem>
                  <SelectItem value="4h">4 Hours</SelectItem>
                  <SelectItem value="8h">8 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            variant="gradient"
            size="lg"
            className="w-full text-base"
            onClick={handleCreateCourse}
            disabled={submitting}
          >
            {submitting ? "Generating..." : "Generate Course"}
          </Button>
        </div>
      </div>
    </div>
  );
}
