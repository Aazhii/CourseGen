import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Plus, Search, LogOut, MessageSquare, LayoutDashboard, MoreHorizontal, Trash2, Edit, Share, FolderInput, Paperclip, X, Trophy, User, ChevronUp } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { useSidebarController } from "../../controllers/useSidebarController";

export default function Sidebar({ courses = [], onCourseDeleted }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();

    const { state, actions } = useSidebarController(courses, onCourseDeleted);
    const { searchTerm, activeMenuId, editingId, tempTitle, filteredCourses, sidebarRef } = state;
    const { setSearchTerm, handleDelete, handleRenameStart, handleRenameSave, handleKeyDown, toggleMenu, setTempTitle, setEditingId } = actions;
    
    // User Context Menu State
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [sidebarRef]);

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

            {/* Navigation Menus */}
            <div className="sidebar-list" style={{ marginTop: '1rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                <Link to="/leaderboard" className={`sidebar-item ${location.pathname === '/leaderboard' ? 'active' : ''}`} style={{ marginBottom: '0.25rem' }}>
                    <Trophy size={16} />
                    <span>Leaderboard</span>
                </Link>
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
            <div className="sidebar-footer" style={{ position: 'relative' }}>
                <div className="user-profile" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} style={{ cursor: 'pointer', flex: 1 }}>
                    <div className="avatar">
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="user-info">
                        <span className="username" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', width: '100%' }}>
                            {user?.username || "User"} 
                            <ChevronUp size={16} style={{ color: "var(--text-secondary)", transition: "transform 0.2s", transform: isUserMenuOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
                        </span>
                    </div>
                </div>

                {isUserMenuOpen && (
                    <div className="user-context-menu fade-up" style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '0.75rem',
                        right: '0.75rem',
                        marginBottom: '0.5rem',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.5rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        zIndex: 100,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem'
                    }}>
                        <button 
                          onClick={() => {
                              navigate("/profile");
                              setIsUserMenuOpen(false);
                          }}
                          className="menu-item"
                          style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}
                        >
                            <User size={16} /> Profile Settings
                        </button>
                        <div style={{ height: '1px', background: 'var(--border)', margin: '0.25rem 0' }} />
                        <button 
                          onClick={() => {
                              logout();
                              setIsUserMenuOpen(false);
                          }}
                          className="menu-item delete"
                          style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}
