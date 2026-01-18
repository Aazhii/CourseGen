import { Link, useNavigate, useLocation } from "react-router-dom";
import { Plus, Search, LogOut, MessageSquare, LayoutDashboard, MoreHorizontal, Trash2, Edit, Share, FolderInput, Paperclip, X } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { useSidebarController } from "../../controllers/useSidebarController";

export default function Sidebar({ courses = [], onCourseDeleted }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();

    const { state, actions } = useSidebarController(courses, onCourseDeleted);
    const { searchTerm, activeMenuId, editingId, tempTitle, filteredCourses, sidebarRef } = state;
    const { setSearchTerm, handleDelete, handleRenameStart, handleRenameSave, handleKeyDown, toggleMenu, setTempTitle, setEditingId } = actions;

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
                            const isEditing = editingId === course.id;

                            return (
                                <div key={course.id} className="sidebar-item-wrapper" style={{ position: 'relative' }}>

                                    {isEditing ? (
                                        <div className="sidebar-item active">
                                            <MessageSquare size={16} />
                                            <input
                                                autoFocus
                                                type="text"
                                                className="sidebar-edit-input"
                                                value={tempTitle}
                                                onChange={(e) => setTempTitle(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                onBlur={() => setEditingId(null)}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                            />
                                        </div>
                                    ) : (
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
                                    )}

                                    {/* Context Menu */}
                                    {isMenuOpen && !isEditing && (
                                        <div className="sidebar-context-menu">
                                            <div className="menu-item placeholder">
                                                <Share size={14} /> Share
                                            </div>
                                            <div className="menu-item" onClick={(e) => handleRenameStart(e, course)}>
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
