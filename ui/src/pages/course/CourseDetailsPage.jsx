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
                            <p className="module-desc">{mod.content || "No content available yet."}</p>

                            <div className="module-actions">
                                <button className="start-btn">
                                    <PlayCircle size={16} /> Start Module
                                </button>
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

            <style>{`
        .course-details-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          text-decoration: none;
          margin-bottom: 2rem;
          transition: color 0.2s;
        }
        .back-link:hover { color: var(--text-main); }
        
        .loading, .center { text-align: center; margin-top: 4rem; color: var(--text-muted); }

        .course-header {
          margin-bottom: 3rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 2rem;
        }
        .course-title-large {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0.5rem 0;
          background: linear-gradient(to right, #fff, #cbd5e1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .difficulty-tag {
          font-size: 0.8rem;
          padding: 0.25rem 0.75rem;
          border-radius: 2rem;
          background: rgba(255,255,255,0.1);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }

        .modules-list h2 {
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
        }

        .module-item {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 1rem;
        }
        .module-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }
        .module-number {
          background: rgba(99, 102, 241, 0.2);
          color: #818cf8;
          padding: 0.2rem 0.6rem;
          border-radius: 0.4rem;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .module-desc {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin-bottom: 1rem;
          line-height: 1.5;
        }
        .start-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-main);
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .start-btn:hover {
          background: var(--primary-color);
          border-color: var(--primary-color);
        }

        .empty-state {
           text-align: center;
           padding: 4rem;
           border: 2px dashed var(--border-color);
           border-radius: 1rem;
           color: var(--text-muted);
           display: flex;
           flex-direction: column;
           align-items: center;
           gap: 1rem;
        }
      `}</style>
        </div>
    );
}
