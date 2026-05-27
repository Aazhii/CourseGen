import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Loader2,
  ChevronRight,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  Settings2,
  ExternalLink,
} from "lucide-react";
import { getCoachResponse } from "@/services/coachApi";
import { cn } from "@/lib/utils";

// --- Configuration for the prerequisite learning flow ---
export interface PrerequisiteFlowConfig {
  /** Allow inline "Quick Learn" via AI Coach */
  enableQuickLearn: boolean;
  /** Allow "Create as Course" navigation */
  enableCreateCourse: boolean;
  /** Exclude external references/citations from quick learn */
  excludeReferences: boolean;
  /** Exclude quiz cards from quick learn */
  excludeQuizCards: boolean;
  /** Include study plan suggestions */
  includeStudyPlan: boolean;
  /** Custom AI prompt prefix for quick learn */
  promptPrefix: string;
  /** Max depth of explanation (brief / standard / detailed) */
  explanationDepth: "brief" | "standard" | "detailed";
}

export const DEFAULT_PREREQ_CONFIG: PrerequisiteFlowConfig = {
  enableQuickLearn: true,
  enableCreateCourse: true,
  excludeReferences: false,
  excludeQuizCards: false,
  includeStudyPlan: true,
  promptPrefix: "",
  explanationDepth: "standard",
};

// --- Props ---
interface PrerequisiteLearnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prerequisite: string;
  courseId?: string;
  courseTitle?: string;
  config?: Partial<PrerequisiteFlowConfig>;
}

// --- Inline content renderer ---
function QuickLearnContent({
  blocks,
  excludeReferences,
  excludeQuizCards,
}: {
  blocks: any[];
  excludeReferences: boolean;
  excludeQuizCards: boolean;
}) {
  const filteredBlocks = blocks.filter((block) => {
    if (excludeQuizCards && block.type === "quiz_card") return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {filteredBlocks.map((block, i) => {
        if (block.type === "text") {
          const content = block.content as { title?: string; body: string };
          return (
            <div key={i} className="space-y-2">
              {content.title && (
                <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  {content.title}
                </h4>
              )}
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {content.body}
              </div>
            </div>
          );
        }

        if (block.type === "study_plan") {
          const plan = block.content as {
            goal: string;
            duration: string;
            steps: { title: string; task: string; time: string }[];
          };
          return (
            <div key={i} className="border rounded-lg p-4 bg-primary/5 space-y-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm text-foreground">
                  Study Plan
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {plan.duration}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{plan.goal}</p>
              <div className="space-y-2">
                {plan.steps?.map((step, j) => (
                  <div
                    key={j}
                    className="flex items-start gap-3 text-sm p-2 rounded-md bg-background/60"
                  >
                    <span className="font-mono text-xs text-primary bg-primary/10 rounded px-1.5 py-0.5 mt-0.5 shrink-0">
                      {j + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-foreground">
                        {step.title}
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {step.task}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {step.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (block.type === "quiz_card") {
          const quiz = block.content as {
            question: string;
            options: string[];
            correctIndex: number;
            explanation?: string;
          };
          return (
            <QuizCard key={i} quiz={quiz} />
          );
        }

        return null;
      })}
    </div>
  );
}

// --- Mini quiz card for quick learn ---
function QuizCard({
  quiz,
}: {
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  };
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const isAnswered = selected !== null;
  const isCorrect = selected === quiz.correctIndex;

  return (
    <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-500" />
        <span className="font-semibold text-sm text-foreground">
          Quick Check
        </span>
      </div>
      <p className="text-sm font-medium text-foreground">{quiz.question}</p>
      <div className="space-y-2">
        {quiz.options.map((opt, i) => {
          const isThis = selected === i;
          const isRight = i === quiz.correctIndex;
          let classes =
            "border rounded-md px-3 py-2 text-sm cursor-pointer transition-all";

          if (isAnswered) {
            if (isRight)
              classes += " border-green-500/50 bg-green-500/10 text-green-600";
            else if (isThis)
              classes += " border-red-500/50 bg-red-500/10 text-red-500";
            else classes += " border-border/50 text-muted-foreground opacity-60";
          } else {
            classes +=
              " border-border hover:border-primary/50 hover:bg-muted/50";
          }

          return (
            <div
              key={i}
              className={classes}
              onClick={() => !isAnswered && setSelected(i)}
            >
              {opt}
            </div>
          );
        })}
      </div>
      {isAnswered && quiz.explanation && (
        <p className="text-xs text-muted-foreground bg-background/60 rounded-md p-2 mt-2">
          {isCorrect ? "✅" : "💡"} {quiz.explanation}
        </p>
      )}
    </div>
  );
}

// --- Settings panel for prerequisite flow config ---
function PrereqSettingsPanel({
  config,
  onChange,
}: {
  config: PrerequisiteFlowConfig;
  onChange: (config: PrerequisiteFlowConfig) => void;
}) {
  const toggle = (key: keyof PrerequisiteFlowConfig) => {
    onChange({ ...config, [key]: !config[key] });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        <Settings2 className="w-3.5 h-3.5" />
        Learning Preferences
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="exclude-refs" className="text-sm cursor-pointer">
            Exclude external references
          </Label>
          <Switch
            id="exclude-refs"
            checked={config.excludeReferences}
            onCheckedChange={() => toggle("excludeReferences")}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="exclude-quiz" className="text-sm cursor-pointer">
            Exclude quizzes
          </Label>
          <Switch
            id="exclude-quiz"
            checked={config.excludeQuizCards}
            onCheckedChange={() => toggle("excludeQuizCards")}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="include-plan" className="text-sm cursor-pointer">
            Include study plan
          </Label>
          <Switch
            id="include-plan"
            checked={config.includeStudyPlan}
            onCheckedChange={() => toggle("includeStudyPlan")}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">Explanation depth</Label>
          <div className="flex gap-2">
            {(["brief", "standard", "detailed"] as const).map((depth) => (
              <button
                key={depth}
                onClick={() => onChange({ ...config, explanationDepth: depth })}
                className={cn(
                  "flex-1 py-1.5 px-2 rounded-md text-xs font-medium capitalize transition-all",
                  config.explanationDepth === depth
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                {depth}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Dialog ---
export default function PrerequisiteLearnDialog({
  open,
  onOpenChange,
  prerequisite,
  courseId,
  courseTitle,
  config: configOverride,
}: PrerequisiteLearnDialogProps) {
  const navigate = useNavigate();
  const mergedConfig = { ...DEFAULT_PREREQ_CONFIG, ...configOverride };

  const [mode, setMode] = useState<"choose" | "learning" | "settings">("choose");
  const [loading, setLoading] = useState(false);
  const [learnedContent, setLearnedContent] = useState<any[] | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [flowConfig, setFlowConfig] = useState<PrerequisiteFlowConfig>(mergedConfig);
  const [error, setError] = useState<string | null>(null);

  const handleQuickLearn = useCallback(async () => {
    setMode("learning");
    setLoading(true);
    setError(null);
    setLearnedContent(null);

    const depthInstructions = {
      brief: "Give a brief, concise overview in 2-3 paragraphs.",
      standard:
        "Give a clear, well-structured explanation with key concepts and examples.",
      detailed:
        "Give a thorough, in-depth explanation with multiple examples, edge cases, and comparisons.",
    };

    let prompt = flowConfig.promptPrefix
      ? `${flowConfig.promptPrefix}\n\n`
      : "";
    prompt += `I'm learning "${courseTitle || "a course"}" and need to understand a prerequisite: "${prerequisite}". `;
    prompt += depthInstructions[flowConfig.explanationDepth] + " ";

    if (flowConfig.includeStudyPlan) {
      prompt +=
        "Also include a short study plan to master this prerequisite. ";
    }
    if (flowConfig.excludeReferences) {
      prompt += "Do NOT include external references or citations. ";
    }
    if (!flowConfig.excludeQuizCards) {
      prompt += "Include a quick quiz question to test understanding. ";
    }

    try {
      const response = await getCoachResponse({
        courseId: courseId,
        message: prompt,
      });

      setLearnedContent(response.blocks || []);
      setSuggestions(response.suggestions || []);
    } catch (err: any) {
      setError(err.message || "Failed to generate explanation. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [prerequisite, courseId, courseTitle, flowConfig]);

  const handleCreateCourse = () => {
    onOpenChange(false);
    navigate(`/create-course?topic=${encodeURIComponent(prerequisite)}`);
  };

  const handleFollowUp = async (question: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCoachResponse({
        courseId: courseId,
        message: `Following up on the prerequisite "${prerequisite}": ${question}`,
        chatHistory: [
          {
            role: "user",
            text: `Explain the prerequisite: ${prerequisite}`,
          },
          {
            role: "assistant",
            text: "I explained the prerequisite above.",
          },
        ],
      });
      setLearnedContent((prev) => [...(prev || []), ...response.blocks]);
      setSuggestions(response.suggestions || []);
    } catch (err: any) {
      setError(err.message || "Failed to get follow-up.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMode("choose");
    setLearnedContent(null);
    setSuggestions([]);
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) handleReset();
        onOpenChange(val);
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5 text-primary" />
            {mode === "settings" ? "Learning Preferences" : prerequisite}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {mode === "choose" &&
              "Choose how you'd like to learn this prerequisite"}
            {mode === "learning" && "AI-powered quick explanation"}
            {mode === "settings" && "Customize how prerequisites are explained"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* Choice mode */}
          {mode === "choose" && (
            <div className="p-6 space-y-4">
              {flowConfig.enableQuickLearn && (
                <button
                  onClick={handleQuickLearn}
                  className="w-full group flex items-start gap-4 p-4 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      Quick Learn
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Get an AI-powered explanation right here. No need to leave
                      your course — understand the basics in minutes.
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary mt-2.5 shrink-0 transition-colors" />
                </button>
              )}

              {flowConfig.enableCreateCourse && (
                <button
                  onClick={handleCreateCourse}
                  className="w-full group flex items-start gap-4 p-4 rounded-xl border border-border/60 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-left"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                    <GraduationCap className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-blue-500 transition-colors">
                      Create Full Course
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Generate a complete, structured course on this topic with
                      modules, lessons, and quizzes.
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-blue-500 mt-2.5 shrink-0 transition-colors" />
                </button>
              )}

              <div className="pt-2 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground gap-1"
                  onClick={() => setMode("settings")}
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  Preferences
                </Button>
              </div>
            </div>
          )}

          {/* Settings mode */}
          {mode === "settings" && (
            <div className="p-6 space-y-4">
              <PrereqSettingsPanel
                config={flowConfig}
                onChange={setFlowConfig}
              />
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode("choose")}
                >
                  Done
                </Button>
              </div>
            </div>
          )}

          {/* Learning mode */}
          {mode === "learning" && (
            <div className="flex flex-col h-full max-h-[calc(85vh-120px)]">
              <ScrollArea className="flex-1 px-6 py-4">
                {loading && !learnedContent && (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">
                      Generating explanation for{" "}
                      <span className="font-medium text-foreground">
                        {prerequisite}
                      </span>
                      ...
                    </p>
                  </div>
                )}

                {error && (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <p className="text-sm text-red-500">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleQuickLearn}
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Retry
                    </Button>
                  </div>
                )}

                {learnedContent && (
                  <div className="space-y-6">
                    <QuickLearnContent
                      blocks={learnedContent}
                      excludeReferences={flowConfig.excludeReferences}
                      excludeQuizCards={flowConfig.excludeQuizCards}
                    />

                    {/* Follow-up suggestions */}
                    {suggestions.length > 0 && (
                      <div className="space-y-2 pt-4 border-t border-border/50">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Want to know more?
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {suggestions.map((s, i) => (
                            <button
                              key={i}
                              disabled={loading}
                              onClick={() => handleFollowUp(s)}
                              className="text-xs px-3 py-1.5 rounded-full border border-border/60 hover:border-primary/40 text-muted-foreground hover:text-primary transition-all disabled:opacity-50"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {loading && (
                      <div className="flex items-center gap-2 py-3">
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        <span className="text-xs text-muted-foreground">
                          Loading more...
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Footer actions */}
              {learnedContent && !loading && (
                <div className="px-6 py-3 border-t border-border/50 flex items-center justify-between gap-2 shrink-0 bg-background">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs gap-1"
                      onClick={handleQuickLearn}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Regenerate
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs gap-1"
                      onClick={() => setMode("settings")}
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      Settings
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1"
                      onClick={handleCreateCourse}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      Create Full Course
                    </Button>
                    <Button
                      size="sm"
                      className="text-xs gap-1"
                      onClick={() => {
                        onOpenChange(false);
                        handleReset();
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Got it
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

