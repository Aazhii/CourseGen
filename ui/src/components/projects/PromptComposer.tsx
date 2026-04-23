import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Play, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreatePrompt } from "@/lib/queries/projects";
import type { ProjectCourseSummary } from "@/services/projectApi";

const schema = z.object({
  text: z.string().trim().min(1, "Prompt cannot be empty.").max(2000, "Max 2000 characters."),
  relatedCourseId: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export function PromptComposer({
  projectId,
  courses,
}: {
  projectId: string;
  courses: ProjectCourseSummary[];
}) {
  const navigate = useNavigate();
  const create = useCreatePrompt(projectId);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { text: "", relatedCourseId: undefined },
  });
  const text = form.watch("text") ?? "";

  async function onSubmit(values: Values) {
    const relatedCourseTitle = courses.find((c) => c.id === values.relatedCourseId)?.title;
    try {
      await create.mutateAsync({ 
        text: values.text, 
        relatedCourseId: values.relatedCourseId, 
        relatedCourseTitle 
      });
      form.reset({ text: "", relatedCourseId: undefined });
      toast.success("Template saved successfully.");
    } catch (err) {
      // Error handled by the global mutation hook onError listener 
      console.error("Save failed:", err);
    }
  }

  return (
    <div className="glass-card rounded-[24px] p-6 sm:p-8 bg-gradient-to-br from-background via-background to-secondary/20 shadow-xl border-primary/10 relative overflow-hidden">
      <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
      
      <header className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">AI Course Composer</h2>
      </header>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        Describe exactly what you want to teach. The AI will generate a structured, comprehensive curriculum explicitly for this project.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 relative z-10">
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Prompt text</FormLabel>
                <FormControl>
                  <Textarea
                    rows={6}
                    placeholder='e.g., "A comprehensive guide to building responsive React applications with TailwindCSS, including modern hooks and state management..."'
                    className="bg-background/50 border-border shadow-inner focus:border-primary/50 text-base p-4 resize-y min-h-[160px] rounded-xl"
                    {...field}
                  />
                </FormControl>
                <div className="flex items-center justify-between mt-1">
                  <FormMessage />
                  <span className="text-xs text-muted-foreground font-mono">{text.length} / 2000</span>
                </div>
              </FormItem>
            )}
          />

          {courses.length > 0 && (
            <FormField
              control={form.control}
              name="relatedCourseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link to existing course (optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                    <FormControl>
                      <SelectTrigger className="max-w-md">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          )}

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <Button type="button" variant="outline" className="gap-2 rounded-xl text-muted-foreground w-full sm:w-auto hover:text-foreground" onClick={form.handleSubmit(onSubmit)} disabled={create.isPending || !text}>
              <Save className="h-4 w-4" /> {create.isPending ? "Saving..." : "Save Template"}
            </Button>
            
            <Button 
              type="button" 
              size="lg" 
              className="gap-2 w-full sm:w-auto rounded-xl px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-semibold" 
              disabled={!text}
              onClick={() => navigate(`/create-course?projectId=${projectId}&topic=${encodeURIComponent(text)}`)}
            >
              <Play className="h-4 w-4" fill="currentColor" /> Generate Magic
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
