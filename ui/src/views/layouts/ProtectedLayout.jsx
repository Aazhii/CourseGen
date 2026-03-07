import { useEffect, useState, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { fetchCourses } from "../../services/courseApi";
import { getMyProjects } from "../../services/projectApi";
import { Menu, X, LayoutDashboard } from "lucide-react";

export default function ProtectedLayout() {
    const [courses, setCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const loadCourses = useCallback(async () => {
        try {
            setCoursesLoading(true);
            const data = await fetchCourses();
            setCourses(data);
        } catch (error) {
            console.error("Failed to load courses for sidebar:", error);
        } finally {
            setCoursesLoading(false);
        }
    }, []);

    const loadProjects = useCallback(async () => {
        try {
            setProjectsLoading(true);
            const data = await getMyProjects();
            setProjects(data);
        } catch (error) {
            console.error("Failed to load projects for sidebar/layout:", error);
        } finally {
            setProjectsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCourses();
        loadProjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="app-layout">
            {/* Sidebar overlay (mobile only) */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? "visible" : ""}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar — gets "open" class on mobile */}
            <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
                <Sidebar 
                    courses={courses} onCourseDeleted={loadCourses} 
                    projects={projects} loadProjects={loadProjects} 
                />
            </div>

            {/* Main area */}
            <main className="main-content-area">
                {/* Mobile sticky top bar */}
                <header className="mobile-header">
                    <div className="mobile-header-brand">
                        <LayoutDashboard size={18} style={{ color: "var(--accent)" }} />
                        <span>AI CourseGen</span>
                    </div>
                    <button
                        className="hamburger-btn"
                        onClick={() => setSidebarOpen(prev => !prev)}
                        aria-label="Toggle sidebar"
                    >
                        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </header>

                <Outlet context={{ courses, loadCourses, coursesLoading, projects, loadProjects, projectsLoading }} />
            </main>
        </div>
    );
}