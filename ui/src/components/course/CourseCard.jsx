import { useNavigate } from "react-router-dom";
import { BookOpen, BarChart } from "lucide-react";

export default function CourseCard({ course }) {
  const navigate = useNavigate();

  return (
    <div className="course-card">
      <div className="course-card-header">
        <h3 className="course-title">{course.title || "Untitled Course"}</h3>
        <span className={`difficulty-badge ${course.difficulty?.toLowerCase()}`}>
          {course.difficulty}
        </span>
      </div>

      <div className="course-card-body">
        <p className="course-info">
          <BookOpen size={16} /> {course.description || course.title}
        </p>
        <p className="course-info">
          <BarChart size={16} /> {course.modules ? course.modules.length : 0} Modules
        </p>
      </div>

      <button
        className="view-btn"
        onClick={() => navigate(`/course/${encodeURIComponent(course.title)}/${course.id}`)}
      >
        View Course
      </button>


    </div>
  );
}
