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
                onClick={() => navigate(`/course/${course.id}`)}
            >
                View Course
            </button>

            <style>{`
        .course-card {
          background: var(--card-bg);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-color);
          border-radius: 1rem;
          padding: 1.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .course-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
          border-color: var(--primary-color);
        }
        .course-card-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 1rem;
        }
        .course-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          line-height: 1.3;
        }
        .difficulty-badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.75rem;
          border-radius: 2rem;
          font-weight: 600;
          text-transform: uppercase;
          background: rgba(255,255,255,0.1);
          color: var(--text-muted);
        }
        .difficulty-badge.beginner { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
        .difficulty-badge.intermediate { background: rgba(234, 179, 8, 0.2); color: #facc15; }
        .difficulty-badge.advanced { background: rgba(239, 68, 68, 0.2); color: #f87171; }

        .course-card-body {
           flex: 1;
           display: flex;
           flex-direction: column;
           gap: 0.5rem;
        }
        .course-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .view-btn {
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary-color);
          border: 1px solid var(--primary-color);
          padding: 0.75rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .view-btn:hover {
          background: var(--primary-color);
          color: white;
        }
      `}</style>
        </div>
    );
}
