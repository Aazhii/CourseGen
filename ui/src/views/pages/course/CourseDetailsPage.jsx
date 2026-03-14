import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCourseById, deleteCourse } from "../../../services/courseApi";
import { ChevronLeft, FileText, Trash2 } from "lucide-react";
import CourseModule from "../../components/course/CourseModule";
import { confirmDelete } from "../../../utils/confirmDelete";
import toast from "react-hot-toast";

export default function CourseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCourseById(id)
      .then(setCourse)
      .catch(() => setError("Failed to load course details."))
      .finally(() => setLoading(false));
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" className="back-link">
          <ChevronLeft size={20} /> Back to Dashboard
        </Link>
        <button className="course-delete-btn" onClick={handleDelete}>
          <Trash2 size={15} />
          Delete Course
        </button>
      </div>

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
            <CourseModule key={idx} module={mod} index={idx} />
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
