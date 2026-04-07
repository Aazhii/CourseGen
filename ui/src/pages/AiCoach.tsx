import { FormEvent, useMemo, useState, useRef, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Bot, ChevronLeft, Send, Sparkles, User, RotateCw, CheckCircle2, XCircle, Clock, BookOpen, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getCoachResponse } from "@/services/coachApi";
import {
  CoachBlock,
  CoachFlashcardContent,
  CoachQuizCardContent,
  CoachResponse,
  CoachStudyPlanContent,
  CoachTextContent,
} from "@/types/coach";

type ChatMessage =
  | { role: "user"; text: string }
  | { role: "assistant"; payload: CoachResponse };

const quickPrompts = [
  "Give me a 5-question quiz from this lesson",
  "Create flashcards from the key ideas",
  "Explain this lesson in simple terms",
  "Make a 30-minute study plan",
];

function QuizCard({ content }: { content: CoachQuizCardContent }) {
  const [selected, setSelected] = useState<number | null>(null);
  const isCorrect = selected !== null && selected === content.correctIndex;

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4 transition-all hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 p-2 rounded-lg shrink-0 mt-0.5">
          <BookOpen className="w-4 h-4 text-primary" />
        </div>
        <p className="font-medium text-foreground leading-relaxed">{content.question}</p>
      </div>
      <div className="grid gap-2">
        {content.options.map((option, index) => {
          const isSelected = selected === index;
          const isThisCorrect = index === content.correctIndex;
          let buttonClass = "border-border bg-background hover:bg-accent/50 text-foreground";
          let Icon = null;

          if (selected !== null) {
            if (isThisCorrect) {
              buttonClass = "border-green-500 bg-green-50 text-green-800 dark:bg-green-500/10 dark:text-green-400";
              if (isSelected) Icon = <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />;
              else Icon = <CheckCircle2 className="w-5 h-5 text-green-600/50 dark:text-green-400/50" />;
            } else if (isSelected) {
              buttonClass = "border-red-500 bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-400";
              Icon = <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
            }
          }

          return (
            <button
              key={`${option}-${index}`}
              onClick={() => selected === null && setSelected(index)}
              disabled={selected !== null}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-all duration-300 ${buttonClass} ${
                selected === null ? "hover:scale-[1.01] hover:border-primary/40 active:scale-[0.99]" : "cursor-default opacity-95"
              }`}
            >
              <span className="pr-2 leading-relaxed text-[15px]">{option}</span>
              {Icon && <div className="shrink-0 animate-in zoom-in duration-300">{Icon}</div>}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div
          className={`mt-3 animate-in fade-in slide-in-from-top-2 duration-500 rounded-xl p-4 text-sm flex gap-3 items-start ${
            isCorrect
              ? "bg-green-50 text-green-800 dark:bg-green-500/10 dark:text-green-300 border border-green-200 dark:border-green-500/20"
              : "bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-300 border border-red-200 dark:border-red-500/20"
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          </div>
          <div className="leading-relaxed">
            <span className="font-semibold block mb-1">
              {isCorrect ? "Excellent! That's correct." : "Not quite right."}
            </span>
            <span className="opacity-90">{content.explanation || "Review the concept and try again."}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function StudyPlanCard({ content }: { content: CoachStudyPlanContent }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="bg-primary/10 p-2.5 rounded-lg shrink-0">
          <GraduationCap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground text-base leading-tight">{content.goal}</h4>
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mt-1.5">
            <Clock className="w-3.5 h-3.5" />
            {content.duration}
          </p>
        </div>
      </div>
      <div className="relative pl-5 space-y-6 pt-3 pb-2">
        <div className="absolute left-[13px] top-5 bottom-4 w-[2px] bg-border/60"></div>
        {content.steps?.map((step, idx) => (
          <div key={`${step.title}-${idx}`} className="relative pl-7 transition-all hover:translate-x-1 duration-300">
            <div className="absolute left-[-15px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background z-10 shadow-sm ring-4 ring-background"></div>
            <div className="bg-secondary/30 rounded-xl p-4 border border-border/50 hover:border-primary/30 hover:bg-secondary/60 transition-colors shadow-sm">
              <div className="flex items-start justify-between mb-2 gap-2">
                <p className="text-[15px] font-semibold text-foreground leading-tight">{step.title}</p>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary whitespace-nowrap tracking-wide uppercase">
                  {step.time}
                </span>
              </div>
              <p className="text-[14px] text-muted-foreground leading-relaxed">{step.task}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Flashcard({ content }: { content: CoachFlashcardContent }) {
  const [flipped, setFlipped] = useState(false);
  
  return (
    <div className="group h-48 w-full max-w-sm [perspective:1000px]" onClick={() => setFlipped(!flipped)}>
      <div
        className={`relative h-full w-full rounded-2xl transition-all duration-700 [transform-style:preserve-3d] cursor-pointer shadow-sm hover:shadow-md ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* Front */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 [backface-visibility:hidden]">
          <div className="absolute top-4 left-4 bg-primary/10 text-primary text-[10px] uppercase font-bold px-2 py-1 rounded-md tracking-wider">
            Flashcard
          </div>
          <p className="text-center font-medium text-foreground text-lg leading-snug">{content.front}</p>
          <div className="absolute bottom-4 right-4 text-xs font-medium text-muted-foreground opacity-60 flex items-center gap-1.5 bg-secondary px-2.5 py-1 rounded-full">
            <RotateCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" /> 
            Tap to flip
          </div>
        </div>
        {/* Back */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-[10px] uppercase font-bold px-2 py-1 rounded-md tracking-wider">
            Answer
          </div>
          <p className="text-[15px] font-medium text-foreground leading-relaxed">{content.back}</p>
          <div className="absolute bottom-4 right-4 text-xs font-medium text-primary/70 flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-full">
            <RotateCw className="w-3 h-3 rotate-180 group-hover:rotate-0 transition-transform duration-500" /> 
            Flip back
          </div>
        </div>
      </div>
    </div>
  );
}

function CoachBlockRenderer({ block }: { block: CoachBlock }) {
  if (block.type === "text") {
    const text = block.content as CoachTextContent;
    return (
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        {text.title && (
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-base">
            <Sparkles className="w-4 h-4 text-primary" />
            {text.title}
          </h4>
        )}
        <p className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap">{text.body}</p>
      </div>
    );
  }

  if (block.type === "quiz_card") {
    return <QuizCard content={block.content as CoachQuizCardContent} />;
  }

  if (block.type === "study_plan") {
    return <StudyPlanCard content={block.content as CoachStudyPlanContent} />;
  }

  if (block.type === "flashcard") {
    return <Flashcard content={block.content as CoachFlashcardContent} />;
  }

  return null;
}

export default function AiCoach() {
  const { courseId, lessonId } = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const headerContext = useMemo(() => {
    if (lessonId) {
      return `Course ${courseId} • Lesson ${lessonId}`;
    }
    return `Course ${courseId}`;
  }, [courseId, lessonId]);

  const submitMessage = async (message: string) => {
    if (!courseId || !message.trim() || sending) return;

    const numericIdPattern = /^\d+$/;
    if (!numericIdPattern.test(courseId) || (lessonId && !numericIdPattern.test(lessonId))) {
      toast.error("Invalid course or lesson context for AI Coach");
      return;
    }

    setMessages((prev) => [...prev, { role: "user", text: message.trim() }]);
    setInput("");
    setSending(true);

    try {
      const payload = await getCoachResponse({
        courseId,
        lessonId,
        message: message.trim(),
      });
      setMessages((prev) => [...prev, { role: "assistant", payload }]);
    } catch (error) {
      console.error("AI coach failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to get coach response");
    } finally {
      setSending(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await submitMessage(input);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-[100dvh] bg-muted/10 relative">
      <header className="flex-none border-b bg-background/80 backdrop-blur-md z-20 px-4 py-3 flex items-center justify-between sticky top-0 shadow-sm">
        <div className="flex items-center gap-3 w-full max-w-4xl mx-auto">
          <Link to={lessonId ? `/courses/${courseId}/lessons/${lessonId}` : `/courses/${courseId}`}>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted/80">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 w-9 h-9 rounded-full flex items-center justify-center shadow-inner">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-[15px] leading-tight text-foreground tracking-tight">AI Coach</h1>
              <p className="text-[11px] font-medium text-muted-foreground leading-tight tracking-wide">{headerContext}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/30" id="chat-container">
        <div className="max-w-3xl w-full mx-auto space-y-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700 pt-12 pb-10">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-primary/10 rotate-3 hover:rotate-6 transition-transform duration-500">
                <Bot className="w-10 h-10 text-primary -rotate-3 hover:-rotate-6 transition-transform duration-500" />
              </div>
              <h2 className="text-2xl font-bold mb-3 tracking-tight text-foreground">How can I help you learn?</h2>
              <p className="text-muted-foreground text-[15px] max-w-md mx-auto mb-10 leading-relaxed">
                I'm your personal AI study coach. Ask me to create a quiz, explain tricky concepts, generate flashcards, or make a custom study plan.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={prompt}
                    onClick={() => submitMessage(prompt)}
                    disabled={sending}
                    style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-background hover:bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all p-4 rounded-xl text-left flex items-center justify-between group"
                  >
                    <span className="text-[14px] font-medium pr-2 text-foreground/80 group-hover:text-primary transition-colors">{prompt}</span>
                    <div className="bg-primary/5 p-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
                      <Send className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-all opacity-50 group-hover:opacity-100 transform translate-x-[-2px] group-hover:translate-x-[1px]" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 pb-6">
              {messages.map((message, index) => (
                <div key={index} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {message.role === "user" ? (
                    <div className="flex flex-row-reverse items-end gap-2.5 mb-2">
                      <div className="shrink-0 bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center mb-1 ring-2 ring-background">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-br-sm shadow-sm max-w-[85%] sm:max-w-[75%] text-[15px] leading-relaxed">
                        {message.text}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 mb-2">
                      <div className="shrink-0 bg-gradient-to-b from-primary/20 to-primary/5 w-8 h-8 rounded-full flex items-center justify-center mt-1 ring-2 ring-background border border-primary/20 shadow-sm">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                      <div className="w-full min-w-0 flex-1 max-w-[95%] sm:max-w-[85%] space-y-3.5">
                        {message.payload.blocks.map((block, blockIndex) => (
                          <div 
                            key={`${index}-${blockIndex}`} 
                            className="animate-in fade-in zoom-in-95 duration-500 origin-top-left" 
                            style={{ animationDelay: `${blockIndex * 150}ms`, animationFillMode: 'both' }}
                          >
                            <CoachBlockRenderer block={block} />
                          </div>
                        ))}
                        {message.payload.suggestions && message.payload.suggestions.length > 0 && (
                          <div 
                            className="flex auto-rows-max flex-wrap gap-2 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-500" 
                            style={{ animationDelay: `${message.payload.blocks.length * 150 + 200}ms`, animationFillMode: 'both' }}
                          >
                            {message.payload.suggestions.map((suggestion) => (
                              <button
                                key={suggestion}
                                onClick={() => submitMessage(suggestion)}
                                disabled={sending}
                                className="text-[13px] font-medium px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary/80 hover:text-primary hover:bg-primary/10 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 transition-all active:scale-95"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {sending && (
                <div className="flex items-start gap-3 mb-2 animate-in fade-in duration-300">
                  <div className="shrink-0 bg-gradient-to-b from-primary/20 to-primary/5 w-8 h-8 rounded-full flex items-center justify-center mt-1 ring-2 ring-background border border-primary/20 shadow-sm">
                    <Bot className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  <div className="bg-card border border-border px-4 py-3.5 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 w-fit">
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>
      </div>

      <div className="flex-none p-4 pb-6 bg-gradient-to-t from-background via-background to-background/50 backdrop-blur-sm z-20 w-full">
        <div className="max-w-3xl w-full mx-auto relative">
          <form 
            onSubmit={onSubmit} 
            className="relative flex items-end gap-2 bg-background p-1.5 rounded-3xl border border-border/80 shadow-lg shadow-black/5 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI Coach a question..."
              className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-3 sm:text-[15px] h-12 resize-none placeholder:text-muted-foreground/60"
              disabled={sending}
              autoComplete="off"
            />
            <Button
              type="submit"
              size="icon"
              className="shrink-0 h-[42px] w-[42px] rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
              disabled={sending || !input.trim()}
            >
              <Send className="h-[18px] w-[18px] ml-0.5" />
            </Button>
          </form>
          <div className="absolute -bottom-5 left-0 right-0 flex justify-center">
            <p className="text-[11px] font-medium text-muted-foreground/60">
              AI Coach may provide inaccurate info. Verify important details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
