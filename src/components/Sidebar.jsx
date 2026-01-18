import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Plus, Search, LogOut, MessageSquare, LayoutDashboard, MoreHorizontal, Trash2, Edit, Share, FolderInput, Paperclip } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { deleteCourse } from "../api/courseApi";

export default function Sidebar({ courses = [], onCourseDeleted }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeMenuId, setActiveMenuId] = useState(null);
    const sidebarRef = useRef(null);

    const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setActiveMenuId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleDelete = async (e, courseId) => {
        e.preventDefault(); // Prevent Navigation
        e.stopPropagation();

        if (window.confirm("Are you sure you want to delete this course?")) {
            try {
                await deleteCourse(courseId);
                if (onCourseDeleted) onCourseDeleted();
                setActiveMenuId(null);
            } catch (error) {
                console.error("Failed to delete", error);
                alert("Failed to delete course");
            }
        }
    };

    const toggleMenu = (e, courseId) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveMenuId(activeMenuId === courseId ? null : courseId);
    };

    return (
        <aside className="sidebar" ref={sidebarRef}>
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
                            const isMenuOpen = activeMenuId === course.id;

                            return (
                                <div key={course.id} className="sidebar-item-wrapper" style={{ position: 'relative' }}>
                                    <Link
                                        to={`/course/${encodeURIComponent(course.title)}/${course.id}`}
                                        className={`sidebar-item ${isActive ? "active" : ""}`}
                                    >
                                        <MessageSquare size={16} />
                                        <span className="truncate">{course.title} </span>

                                        {/* More Options Button (Visible on Hover or active) */}
                                        <button
                                            className={`more-options-btn ${isMenuOpen ? 'force-visible' : ''}`}
                                            onClick={(e) => toggleMenu(e, course.id)}
                                        >
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </Link>

                                    {/* Context Menu */}
                                    {isMenuOpen && (
                                        <div className="sidebar-context-menu">
                                            <div className="menu-item placeholder">
                                                <Share size={14} /> Share
                                            </div>
                                            <div className="menu-item placeholder">
                                                <Edit size={14} /> Rename
                                            </div>
                                            <div className="menu-item placeholder">
                                                <FolderInput size={14} /> Move to project
                                            </div>
                                            <div className="menu-divider"></div>
                                            <div className="menu-item delete" onClick={(e) => handleDelete(e, course.id)}>
                                                <Trash2 size={14} /> Delete
                                            </div>
                                        </div>
                                    )}
                                </div>
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
