import { useNavigate } from "react-router-dom";
import { BookOpen, BarChart, Trash2 } from "lucide-react";

export default function CourseCard({ course, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="course-card">
      <div className="course-card-header">
        <h3 className="course-title">{course.title || "Untitled Course"}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {course.difficulty && (
            <span className={`difficulty-badge ${course.difficulty?.toLowerCase()}`}>
              {course.difficulty}
            </span>
          )}
          {onDelete && (
            <button
              className="project-card-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(course.id);
              }}
              title="Delete Course"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
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

