import { FileText, PlayCircle } from "lucide-react";

export default function CourseLesson({ lesson, index }) {
    return (
        <div className="lesson-item">
            <div className="lesson-info">
                <FileText size={16} className="lesson-icon" />
                <span>{lesson.title || `Lesson ${index + 1}`}</span>
            </div>
            <button className="start-lesson-btn">
                <PlayCircle size={14} /> Start
            </button>
        </div>
    );
}
