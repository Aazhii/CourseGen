import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCourseById, deleteCourse } from "../../../services/courseApi";
import { getCourseProgress } from "../../../services/progressApi";
import { useAuth } from "../../../auth/AuthContext";
import { ChevronLeft, FileText, Trash2, Share2 } from "lucide-react";
import CourseModule from "../../components/course/CourseModule";
import { confirmDelete } from "../../../utils/confirmDelete";
import toast from "react-hot-toast";

export default function CourseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getCourseById(id).then(setCourse).catch(() => setError("Failed to load course details.")),
      getCourseProgress(id).then(setProgress).catch((e) => console.log("Progress not found or err:", e))
    ]).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = () => {
    confirmDelete({
      title: "Delete this course?",
      description: "This action cannot be undone.",
      onConfirm: async () => {
        try {
          await deleteCourse(id);
          toast.success("Course deleted.");
          navigate("/");
        } catch {
          toast.error("Failed to delete course.");
        }
      },
    });
  };

  if (loading) return <div className="loading">Loading course...</div>;
  if (error) return <div className="error-text center">{error}</div>;
  if (!course) return <div className="error-text center">Course not found</div>;

  return (
    <div className="course-details-container">
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" className="back-link">
          <ChevronLeft size={20} /> Back to Dashboard
        </Link>
        <div className="course-actions">
          {user && course && user.id === course.creator && (
            <>
              <Link to={`/course/${id}/sharing`} className="auth-btn outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: "0.5rem", padding: "8px 16px" }}>
                <Share2 size={15} />
                Share Course
              </Link>
              <button className="course-delete-btn" onClick={handleDelete}>
                <Trash2 size={15} />
                Delete Course
              </button>
            </>
          )}
        </div>
      </header>

      <div className="course-header">
        <span className={`difficulty-tag ${course.difficulty?.toLowerCase()}`}>
          {course.difficulty}
        </span>
        <h1 className="course-title-large">{course.title}</h1>
        <p className="course-topic">Topic: {course.description || course.title}</p>
        
        {progress && (
          <div style={{ marginTop: "1rem", background: "var(--bg-secondary)", padding: "1rem", borderRadius: "0.5rem", border: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Course Progress</span>
              <span style={{ fontSize: "0.9rem", color: "var(--accent)" }}>{Math.round(progress.courseProgress)}% ({progress.completedLessons} / {progress.totalLessons})</span>
            </div>
            <div style={{ width: "100%", height: "8px", background: "var(--bg-primary)", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ width: `${progress.courseProgress}%`, height: "100%", background: "var(--accent)", transition: "width 0.3s ease" }}></div>
            </div>
          </div>
        )}
      </div>

      <div className="modules-list">
        <h2>Course Modules</h2>
        {course.modules && course.modules.length > 0 ? (
          course.modules.map((mod, idx) => (
            <CourseModule key={idx} module={mod} index={idx} progress={progress} />
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
