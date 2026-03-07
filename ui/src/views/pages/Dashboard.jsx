import { useNavigate, useOutletContext } from "react-router-dom";
import toast from "react-hot-toast";
import { deleteCourse } from "../../services/courseApi";
import CourseCard from "../components/course/CourseCard";
import { Plus, Loader } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { courses, loadCourses, coursesLoading } = useOutletContext();

  const handleDeleteCourse = async (courseId) => {
    toast((t) => (
      <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', textAlign: 'center', padding: '0 35px' }}>
        <p style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: '600' }}>
          Delete this course?
        </p>

        <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          This action cannot be undone.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button
            style={{
              padding: '6px 12px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: '500'
            }}
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>

          <button
            style={{
              padding: '6px 12px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontWeight: '600'
            }}
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await deleteCourse(courseId);
                loadCourses();
                toast.success("Course deleted successfully.");
              } catch {
                toast.error("Failed to delete course");
              }
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  return (
    <>
      <div className="dashboard-content" style={{ marginTop: '1rem' }}>
        <header className="dashboard-header">
          <div>
            <h1>My Courses</h1>
            <p className="subtitle">Manage and learn from your AI-generated courses.</p>
          </div>
          <button className="create-btn" onClick={() => navigate("/create-course")}>
            <Plus size={20} /> Create New Course
          </button>
        </header>

        {coursesLoading ? (
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
                  <CourseCard key={course.id} course={course} onDelete={handleDeleteCourse} />
                ))}
              </div>
            )}
          </>
        )}


      </div>
    </>
  );
}
