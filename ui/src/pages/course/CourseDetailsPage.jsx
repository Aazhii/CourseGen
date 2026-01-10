import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCourseById } from "../../api/courseApi";
import { Book, ChevronLeft, PlayCircle, FileText } from "lucide-react";

export default function CourseDetailsPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCourseById(id)
      .then(setCourse)
      .catch(err => setError("Failed to load course details."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading course...</div>;
  if (error) return <div className="error-text center">{error}</div>;
  if (!course) return <div className="error-text center">Course not found</div>;

  return (
    <div className="course-details-container">
      <Link to="/" className="back-link">
        <ChevronLeft size={20} /> Back to Dashboard
      </Link>

      <div className="course-header">
        <span className={`difficulty-tag ${course.difficulty?.toLowerCase()}`}>
          {course.difficulty}
        </span>
        <h1 className="course-title-large">{course.title}</h1>
        <p className="course-topic">Topic: {course.description || course.title}</p>
      </div>

      <div className="modules-list">
        <h2>Course Modules</h2>
        {course.modules && course.modules.length > 0 ? (
          course.modules.map((mod, idx) => (
            <div key={idx} className="module-item">
              <div className="module-header">
                <span className="module-number">Module {idx + 1}</span>
                <h3>{mod.title || "Untitled Module"}</h3>
              </div>

              {/* Render Nested Lessons */}
              <div className="lessons-list">
                {mod.lessons && mod.lessons.map((lesson, lIdx) => (
                  <div key={lIdx} className="lesson-item">
                    <div className="lesson-info">
                      <FileText size={16} className="lesson-icon" />
                      <span>{lesson.title || `Lesson ${lIdx + 1}`}</span>
                    </div>
                    <button className="start-lesson-btn">
                      <PlayCircle size={14} /> Start
                    </button>
                  </div>
                ))}
                {(!mod.lessons || mod.lessons.length === 0) && (
                  <p className="no-lessons">No lessons in this module.</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <FileText size={40} />
            <p>No modules generated for this course yet.</p>
          </div>
        )}
      </div>


    </div>
  );
}
