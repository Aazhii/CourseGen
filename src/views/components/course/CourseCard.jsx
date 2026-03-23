import { useNavigate } from "react-router-dom";
import { BookOpen, BarChart, Trash2, Eye, EyeOff } from "lucide-react";

export default function CourseCard({ course, onDelete, onToggleStatus }) {
  const navigate = useNavigate();

  const isDeactivated = course.active === false;

  return (
    <div className="course-card" style={isDeactivated ? { opacity: 0.7 } : {}}>
      <div className="course-card-header">
        <h3 className="course-title">{course.title || "Untitled Course"}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {course.difficulty && (
            <span className={`difficulty-badge ${course.difficulty?.toLowerCase()}`}>
              {course.difficulty}
            </span>
          )}
          {isDeactivated && (
            <span className="difficulty-tag bg-red-500 text-white" style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
              Deactivated
            </span>
          )}
          {onToggleStatus && (
            <button
              className="project-card-delete-btn"
              style={{ color: isDeactivated ? "#10b981" : "#f59e0b" }}
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus(course.id, !isDeactivated);
              }}
              title={isDeactivated ? "Activate Course" : "Deactivate Course"}
            >
              {isDeactivated ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
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

