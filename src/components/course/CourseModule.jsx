import CourseLesson from "./CourseLesson";

export default function CourseModule({ module, index }) {
    return (
        <div className="module-item">
            <div className="module-header">
                <span className="module-number">Module {index + 1}</span>
                <h3>{module.title || "Untitled Module"}</h3>
            </div>

            <div className="lessons-list">
                {module.lessons && module.lessons.map((lesson, lIdx) => (
                    <CourseLesson key={lIdx} lesson={lesson} index={lIdx} moduleId={module.id} />
                ))}
                {(!module.lessons || module.lessons.length === 0) && (
                    <p className="no-lessons">No lessons in this module.</p>
                )}
            </div>
        </div>
    );
}
