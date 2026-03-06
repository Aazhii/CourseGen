import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { deleteCourse, updateCourse } from "../services/courseApi";

export function useSidebarController(courses, onCourseDeleted) {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [tempTitle, setTempTitle] = useState("");
    const sidebarRef = useRef(null);

    const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setActiveMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDelete = async (e, courseId) => {
        e.preventDefault();
        e.stopPropagation();
        
        toast((t) => (
            <div>
                <p style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: '600' }}>Delete this course?</p>
                <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>This action cannot be undone.</p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button 
                        style={{ padding: '6px 12px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '500' }}
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancel
                    </button>
                    <button 
                        style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: '600' }}
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await deleteCourse(courseId);
                                if (onCourseDeleted) onCourseDeleted();
                                setActiveMenuId(null);
                                toast.success("Course deleted successfully.");
                            } catch (error) {
                                console.error("Failed to delete", error);
                                toast.error("Failed to delete course");
                            }
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const handleRenameStart = (e, course) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingId(course.id);
        setTempTitle(course.title);
        setActiveMenuId(null);
    };

    const handleRenameSave = async () => {
        if (!tempTitle.trim()) {
            setEditingId(null);
            return;
        }
        try {
            await updateCourse(editingId, { title: tempTitle });
            if (onCourseDeleted) onCourseDeleted();
        } catch (error) {
            console.error("Failed to rename", error);
            alert("Failed to rename course");
        } finally {
            setEditingId(null);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleRenameSave();
        else if (e.key === "Escape") setEditingId(null);
    };

    const toggleMenu = (e, courseId) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveMenuId(activeMenuId === courseId ? null : courseId);
    };

    return {
        state: { searchTerm, activeMenuId, editingId, tempTitle, filteredCourses, sidebarRef },
        actions: { setSearchTerm, handleDelete, handleRenameStart, handleRenameSave, handleKeyDown, toggleMenu, setTempTitle, setEditingId }
    };
}
