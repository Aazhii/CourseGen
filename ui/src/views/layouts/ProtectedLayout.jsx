import { useEffect, useState, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { fetchCourses } from "../../services/courseApi";
import { Menu, X, LayoutDashboard } from "lucide-react";

export default function ProtectedLayout() {
    const [courses, setCourses] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const loadCourses = useCallback(async () => {
        try {
            const data = await fetchCourses();
            setCourses(data);
        } catch (error) {
            console.error("Failed to load courses for sidebar:", error);
        }
    }, []);

    useEffect(() => {
        loadCourses();
    }, []);

    useEffect(() => {
        if (location.pathname === "/" || location.pathname.includes("create-course")) {
            loadCourses();
        }
    }, [location.pathname]);

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
                <Sidebar courses={courses} onCourseDeleted={loadCourses} />
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

                <Outlet />
            </main>
        </div>
    );
}