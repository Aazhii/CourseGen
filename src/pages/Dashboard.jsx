import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { fetchCourses } from "../api/courseApi";
import CourseCard from "../components/course/CourseCard";
import { Plus, Loader } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses()
      .then(setCourses)
      .catch(err => console.error(err)) // specific error handling can be improved
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1>My Courses</h1>
          <p className="subtitle">Manage and learn from your AI-generated courses.</p>
        </div>

        <button className="create-btn" onClick={() => navigate("/create-course")}>
          <Plus size={20} /> Create New Course
        </button>
      </header>

      {loading ? (
        <div className="loading-state">
          <Loader className="spin" size={32} />
        </div>
      ) : (
        <>
          {courses.length === 0 ? (
            <div className="empty-dashboard">
              <h2>No courses yet</h2>
              <p>Start your learning journey by creating your first AI course.</p>
              <button className="create-btn small" onClick={() => navigate("/create-course")}>
                Get Started
              </button>
            </div>
          ) : (
            <div className="course-grid">
              {courses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </>
      )}

      <style>{`
        .dashboard-header {
           display: flex;
           justify-content: space-between;
           align-items: center;
           margin-bottom: 2.5rem;
        }
        .dashboard-header h1 {
           font-size: 2rem;
           font-weight: 700;
        }
        .subtitle {
           color: var(--text-muted);
           margin-top: 0.25rem;
        }

        .create-btn {
           background: var(--primary-color);
           color: white;
           border: none;
           padding: 0.75rem 1.5rem;
           border-radius: 0.5rem;
           font-weight: 600;
           cursor: pointer;
           display: flex;
           align-items: center;
           gap: 0.5rem;
           transition: background 0.2s;
           box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }
        .create-btn:hover { background: var(--primary-hover); }
        .create-btn.small { margin-top: 1.5rem; }

        .course-grid {
           display: grid;
           grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
           gap: 2rem;
        }

        .loading-state, .empty-dashboard {
           display: flex;
           flex-direction: column;
           align-items: center;
           justify-content: center;
           padding: 4rem 0;
           color: var(--text-muted);
           text-align: center;
        }
        .empty-dashboard h2 {
           color: white;
           margin-bottom: 0.5rem;
        }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </>
  );
}
