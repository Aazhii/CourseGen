import { FileText, Play } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function CourseLesson({ lesson, index, moduleId }) {
    const navigate = useNavigate();
    const { id: courseId } = useParams(); // Start from CourseDetailsPage URL

    const handleStart = () => {
        // Navigate to: /course/:courseId/module/:moduleId/lesson/:lessonId
        navigate(`/course/${courseId}/module/${moduleId}/lesson/${lesson.id}`);
    };

    return (
        <div className="lesson-item">
            <div className="lesson-info">
                {lesson.isCompleted || lesson.completed ? (
                    <div style={{ color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                ) : (
                    <FileText size={16} className="lesson-icon" />
                )}
                <span style={{ color: lesson.isCompleted || lesson.completed ? "#94a3b8" : "inherit" }}>
                    {lesson.title || `Lesson ${index + 1}`}
                </span>
            </div>
            <button className="start-lesson-btn" onClick={handleStart}>
                <Play size={14} className="play-icon" /> Start
            </button>
        </div>
    );
}
