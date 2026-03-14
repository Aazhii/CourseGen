import { useNavigate, useOutletContext } from "react-router-dom";
import toast from "react-hot-toast";
import { deleteCourse } from "../../services/courseApi";
import CourseCard from "../components/course/CourseCard";
import { confirmDelete } from "../../utils/confirmDelete";
import { Plus, Loader } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { courses, loadCourses, coursesLoading } = useOutletContext();

  const handleDeleteCourse = (courseId) => {
    confirmDelete({
      title: "Delete this course?",
      description: "This action cannot be undone.",
      onConfirm: async () => {
        try {
          await deleteCourse(courseId);
          loadCourses();
          toast.success("Course deleted successfully.");
        } catch {
          toast.error("Failed to delete course.");
        }
      },
    });
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
