import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getLessonById, generateLessonContent } from "../../../services/courseApi";
import { markLessonComplete, markLessonIncomplete, getCourseProgress } from "../../../services/progressApi";
import { ChevronLeft, Loader2, CheckCircle, Circle } from "lucide-react";
import toast from "react-hot-toast";

export default function LessonPage() {
    const { courseId, moduleId, lessonId } = useParams();
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [updatingProgress, setUpdatingProgress] = useState(false);

    useEffect(() => {
        loadLesson();
    }, [lessonId]);

    const loadLesson = async () => {
        try {
            setLoading(true);
            const data = await getLessonById(lessonId);
            setLesson(data);

            const hasContent = data.content && Array.isArray(data.content) && data.content.length > 0;
            const isEnriched = data.enriched || data.isEnriched || hasContent;
            
            setIsCompleted(data.isCompleted || data.completed || false);

            if (data && !isEnriched) {
                await handleGenerate(data); // ← awaited now
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load lesson.");
        } finally {
            setLoading(false);
        }
    };

    const toggleComplete = async () => {
        setUpdatingProgress(true);
        try {
            if (isCompleted) {
                await markLessonIncomplete(lessonId, courseId);
                setIsCompleted(false);
                toast.success("Lesson marked as incomplete");
            } else {
                await markLessonComplete(lessonId, courseId);
                setIsCompleted(true);
                toast.success("Lesson marked as completed");
            }
        } catch (err) {
            toast.error("Failed to update progress.");
        } finally {
            setUpdatingProgress(false);
        }
    };

    const handleGenerate = async (currentLesson) => {
        try {
            setGenerating(true);
            // We need courseId and moduleId from URL since lesson object might not have full parents populated if flattened
            // But wait, the lesson object from backend usually has 'module' -> 'course'.
            // However, the URL params are safest.
            const res = await generateLessonContent(courseId, moduleId, lessonId);
            setLesson(res);
        } catch (err) {
            console.error("Generation failed", err);
            setError("Failed to generate lesson content. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <div className="loading center"><Loader2 className="spin" size={40} /> Loading Lesson...</div>;
    if (error) return <div className="error-text center">{error}</div>;
    if (!lesson) return <div className="error-text center">Lesson not found</div>;

    return (
        <div className="course-details-container">
            <Link to={`/course/${courseId}`} className="back-link">
                <ChevronLeft size={20} /> Back to Course
            </Link>

            <header className="course-header">
                <h1 className="course-title-large">{lesson.title}</h1>
            </header>

            {generating ? (
                <div className="loading-state">
                    <Loader2 className="spin" size={48} />
                    <p style={{ marginTop: "1rem", color: "#94a3b8" }}>
                        Generating your lesson content with AI...<br />
                        This may take a few seconds.
                    </p>
                </div>
            ) : (
                <div className="lesson-content" style={{ paddingBottom: "4rem" }}>
                    {renderContent(lesson.content)}

                    <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "center" }}>
                        <button 
                            className={`auth-btn ${isCompleted ? 'outline' : ''}`} 
                            onClick={toggleComplete}
                            disabled={updatingProgress}
                            style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: "0.5rem", 
                                padding: "12px 24px", 
                                background: isCompleted ? "transparent" : "#10b981",
                                borderColor: isCompleted ? "#10b981" : "transparent",
                                color: isCompleted ? "#10b981" : "white"
                            }}
                        >
                            {updatingProgress ? <Loader2 size={20} className="spin" /> : (isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />)}
                            {isCompleted ? "Completed" : "Mark as Complete"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function renderContent(content) {
    if (!content || !Array.isArray(content) || content.length === 0) {
        return <p className="center text-muted">No content available.</p>;
    }

    return content.map((block, idx) => {
        switch (block.type) {
            case "text":
                return <p key={idx} className="lesson-text" style={{ marginBottom: "1.5rem", lineHeight: "1.8", color: "#e2e8f0", fontSize: "1.1rem" }}>{block.content}</p>;
            case "code":
                return (
                    <pre key={idx} style={{ background: "#0f172a", padding: "1.5rem", borderRadius: "0.5rem", overflowX: "auto", border: "1px solid #334155", marginBottom: "1.5rem" }}>
                        <code style={{ fontFamily: "monospace", color: "#a5f3fc" }}>{block.content}</code>
                    </pre>
                );
            case "image_prompt":
                // Fallback if no real image gen yet
                return (
                    <div key={idx} style={{ background: "#334155", padding: "1rem", borderRadius: "0.5rem", marginBottom: "1.5rem", fontStyle: "italic", color: "#cbd5e1" }}>
                        🖼 Suggested Image: {block.content}
                    </div>
                );
            default:
                return null;
        }
    });
}
