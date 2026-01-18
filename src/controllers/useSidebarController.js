import { useState, useRef, useEffect } from "react";
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
