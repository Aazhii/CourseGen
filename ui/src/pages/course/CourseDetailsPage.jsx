import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCourseById } from "../../api/courseApi";
import { ChevronLeft, FileText } from "lucide-react";
import CourseModule from "../../components/course/CourseModule";

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
