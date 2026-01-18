import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { fetchCourses, deleteCourse } from "../../services/courseApi";
import CourseCard from "../components/course/CourseCard";
import { Plus, Loader } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses()
      .then(setCourses)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteCourse = async (courseId) => {
    try {
      await deleteCourse(courseId);
      setCourses(courses.filter(course => course.id !== courseId));
    } catch (error) {
      console.error("Failed to delete course:", error);
      alert("Failed to delete course");
    }
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
