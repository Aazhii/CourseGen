import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { fetchCourses } from "../api/courseApi";

export default function ProtectedLayout() {
    const [courses, setCourses] = useState([]);
    const location = useLocation();

    // Fetch courses to populate the sidebar
    const loadCourses = async () => {
        try {
            const data = await fetchCourses();
            setCourses(data);
        } catch (error) {
            console.error("Failed to load courses for sidebar:", error);
        }
    };

    useEffect(() => {
        loadCourses();
    }, []);

    // Re-fetch courses if we suspect a new one was added (optional optimization: context or global state)
    // For now, simpler: re-fetch on navigation could be overkill, so we rely on initial load
    // or we can expose a refresh function.
    // Ideally, if a user creates a course, we want it to show up.
    // We can treat this simpler by re-fetching when on dashboard or specific paths, or just rely on mount.
    // Let's add a basic re-fetch when location changes to "/" (Dashboard) to ensure list is up to date after deletion/creation
    useEffect(() => {
        if (location.pathname === "/" || location.pathname.includes("create-course")) {
            loadCourses();
        }
    }, [location.pathname]);


    return (
        <div className="app-layout">
            <Sidebar courses={courses} />
            <main className="main-content-area">
                <Outlet />
            </main>
        </div>
    );
}
