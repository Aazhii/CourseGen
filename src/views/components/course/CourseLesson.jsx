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
                <FileText size={16} className="lesson-icon" />
                <span>{lesson.title || `Lesson ${index + 1}`}</span>
            </div>
            <button className="start-lesson-btn" onClick={handleStart}>
                <Play size={14} className="play-icon" /> Start
            </button>
        </div>
    );
}
