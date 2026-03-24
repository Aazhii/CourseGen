import { useNavigate, useOutletContext } from "react-router-dom";
import toast from "react-hot-toast";
import { deleteCourse, fetchCoursesSharedByMe } from "../../services/courseApi";
import { getMyProgress } from "../../services/progressApi";
import CourseCard from "../components/course/CourseCard";
import { confirmDelete } from "../../utils/confirmDelete";
import { Plus, Loader, Users, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import NotificationBell from "../components/notification/NotificationBell";

export default function Dashboard() {
  const navigate = useNavigate();
  const { courses, loadCourses, coursesLoading } = useOutletContext();
  const [activeTab, setActiveTab] = useState("my-courses");
  const [sharedCourses, setSharedCourses] = useState([]);
  const [sharedLoading, setSharedLoading] = useState(false);
  const [sharedByMeCourses, setSharedByMeCourses] = useState([]);
  const [sharedByMeLoading, setSharedByMeLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "shared") {
      loadSharedCourses();
    } else if (activeTab === "shared-by-me") {
      loadSharedByMeCourses();
    }
  }, [activeTab]);

  const loadSharedCourses = async () => {
    setSharedLoading(true);
    try {
      const data = await getMyProgress();
      setSharedCourses(data || []);
    } catch (err) {
      toast.error("Failed to load shared with me courses.");
    } finally {
      setSharedLoading(false);
    }
  };

  const loadSharedByMeCourses = async () => {
    setSharedByMeLoading(true);
    try {
      const data = await fetchCoursesSharedByMe();
      setSharedByMeCourses(data || []);
    } catch (err) {
      toast.error("Failed to load courses shared by me.");
    } finally {
      setSharedByMeLoading(false);
    }
  };

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
        <header className="dashboard-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1>Courses Dashboard</h1>
            <p className="subtitle">Manage courses you've created or enrolled in.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="create-btn" onClick={() => navigate("/create-course")}>
              <Plus size={20} /> Create New Course
            </button>
            <NotificationBell />
          </div>
        </header>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
          <button
            onClick={() => setActiveTab("my-courses")}
            style={{
              background: "transparent", border: "none", fontSize: "1.1rem", cursor: "pointer",
              fontWeight: activeTab === "my-courses" ? "bold" : "normal",
              color: activeTab === "my-courses" ? "var(--accent)" : "var(--text-secondary)",
              display: "flex", alignItems: "center", gap: "0.5rem"
            }}
          >
            <BookOpen size={18} /> My Courses
          </button>
          <button
            onClick={() => setActiveTab("shared")}
            style={{
              background: "transparent", border: "none", fontSize: "1.1rem", cursor: "pointer",
              fontWeight: activeTab === "shared" ? "bold" : "normal",
              color: activeTab === "shared" ? "var(--accent)" : "var(--text-secondary)",
              display: "flex", alignItems: "center", gap: "0.5rem"
            }}
          >
            <Users size={18} /> Shared With Me
          </button>
          <button
            onClick={() => setActiveTab("shared-by-me")}
            style={{
              background: "transparent", border: "none", fontSize: "1.1rem", cursor: "pointer",
              fontWeight: activeTab === "shared-by-me" ? "bold" : "normal",
              color: activeTab === "shared-by-me" ? "var(--accent)" : "var(--text-secondary)",
              display: "flex", alignItems: "center", gap: "0.5rem"
            }}
          >
            <Users size={18} /> Shared By Me
          </button>
        </div>

        {activeTab === "my-courses" ? (
          coursesLoading ? (
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
          )
        ) : activeTab === "shared" ? (
          sharedLoading ? (
            <div className="loading-state">
              <Loader className="spin" size={32} />
            </div>
          ) : (
            <>
              {sharedCourses.length === 0 ? (
                <div className="empty-dashboard">
                  <h2>No shared courses</h2>
                  <p>When someone shares a course with you, it will appear here.</p>
                </div>
              ) : (
                <div className="course-grid">
                  {sharedCourses.map(progress => (
                    <div key={progress.courseId} className="course-card" onClick={() => navigate(`/course/${progress.courseId}`)} style={{ cursor: "pointer" }}>
                      <div className="course-card-content">
                        <span className="difficulty-tag bg-blue-500 text-white">Shared With Me</span>
                        <h3 className="course-title" style={{ marginTop: "1rem" }}>{progress.courseName}</h3>
                        <p className="course-info" style={{ marginTop: "0.5rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", color: "var(--text-secondary)" }}>
                          {progress.courseDescription || "No description provided."}
                        </p>
                        <div style={{ marginTop: "1rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                            <span>Progress</span>
                            <span>{Math.round(progress.courseProgress)}%</span>
                          </div>
                          <div style={{ width: "100%", height: "6px", background: "var(--bg-primary)", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ width: `${progress.courseProgress}%`, height: "100%", background: "var(--accent)", transition: "width 0.3s ease" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )
        ) : (
          sharedByMeLoading ? (
            <div className="loading-state">
              <Loader className="spin" size={32} />
            </div>
          ) : (
            <>
              {sharedByMeCourses.length === 0 ? (
                <div className="empty-dashboard">
                  <h2>You haven't shared any courses</h2>
                  <p>Use the "Share Course" button inside a course to invite students.</p>
                </div>
              ) : (
                <div className="course-grid">
                  {sharedByMeCourses.map(course => (
                    <CourseCard key={`sharedbyme-${course.id}`} course={course} onDelete={handleDeleteCourse} />
                  ))}
                </div>
              )}
            </>
          )
        )}
      </div>
    </>
  );
}
