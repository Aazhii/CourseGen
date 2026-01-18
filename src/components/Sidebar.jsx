import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Plus, Search, LogOut, MessageSquare, LayoutDashboard } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function Sidebar({ courses = [] }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <aside className="sidebar">
            {/* Brand / New Chat Header */}
            <div className="sidebar-header">
                <div
                    className="sidebar-brand"
                    onClick={() => navigate("/")}
                    title="Go to Dashboard"
                >
                    <LayoutDashboard size={24} className="text-primary" />
                    <span className="brand-name">AI CourseGen</span>
                </div>

                <button
                    className="new-chat-btn"
                    onClick={() => navigate("/create-course")}
                >
                    <Plus size={16} />
                    <span>New Project</span>
                </button>
            </div>

            {/* Search */}
            <div className="sidebar-search">
                <Search size={14} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Course List (History) */}
            <div className="sidebar-list">
                <div className="list-label">Recents</div>
                <div className="list-content">
                    {filteredCourses.length === 0 ? (
                        <div className="empty-sidebar-state">No courses found</div>
                    ) : (
                        filteredCourses.map((course) => {
                            const isActive = location.pathname.includes(`/course/${encodeURIComponent(course.title)}/${course.id}`);
                            return (
                                <Link
                                    key={course.id}
                                    to={`/course/${encodeURIComponent(course.title)}/${course.id}`}
                                    className={`sidebar-item ${isActive ? "active" : ""}`}
                                >
                                    <MessageSquare size={16} />
                                    <span className="truncate">{course.title} </span>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>

            {/* User / Footer */}
            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="avatar">
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="user-info">
                        <span className="username">{user?.username || "User"}</span>
                    </div>
                </div>
                <button className="logout-btn" onClick={logout} title="Logout">
                    <LogOut size={18} />
                </button>
            </div>
        </aside>
    );
}
