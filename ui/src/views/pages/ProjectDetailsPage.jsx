import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Upload, Loader2, Play } from "lucide-react";
import { getProjectById } from "../../services/projectApi";
import { createCourse } from "../../services/courseApi";
import CourseCard from "../components/course/CourseCard";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Enable relative time
dayjs.extend(relativeTime);

export default function ProjectDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Using global states from context is better, but fetching locally first
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    
    // Generator State
    const [topic, setTopic] = useState("");

    useEffect(() => {
        loadProjectDetails();
    }, [id]);

    const loadProjectDetails = async () => {
        try {
            setLoading(true);
            const data = await getProjectById(id);
            // Expected to return { id, name, description, courses: [{course}] }
            setProject(data);
        } catch (error) {
            console.error("Failed to load project details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateCourse = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return;

        try {
            setGenerating(true);
            // Assume we pass projectId to tie the new course to this project
            const payload = { 
                topic, 
                difficulty: "Medium", 
                duration: "2-4 Hours",
                projectId: id 
            };
            const res = await createCourse(payload);
            
            // Reload project specifically to see the newly seeded course
            await loadProjectDetails();
            setTopic("");
        } catch (err) {
            console.error("Failed to generate course:", err);
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="project-details-loading">
                <Loader2 className="spin" size={32} />
            </div>
        );
    }

    if (!project) {
        return <div className="project-details-error">Project not found.</div>;
    }

    return (
        <div className="project-details-page fade-up">
            
            {/* Header / Navigation */}
            <button className="back-to-projects-btn" onClick={() => navigate("/projects")}>
                <ArrowLeft size={16} /> All projects
            </button>
            <div className="project-header-bar">
                <h1 className="project-details-name">{project.name}</h1>
                <div className="project-header-actions">
                    <button className="icon-btn"><span className="dots-icon">•••</span></button>
                    <button className="icon-btn">☆</button>
                </div>
            </div>

            {/* Course Generator Input Block (Claude Style) */}
            <div className="project-generator-block">
                <form onSubmit={handleGenerateCourse}>
                    <textarea 
                        className="project-generator-input"
                        placeholder="Generate a new course..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleGenerateCourse(e);
                            }
                        }}
                    />
                    <div className="project-generator-toolbar">
                        <button type="button" className="toolbar-icon-btn">
                            <Plus size={18} />
                        </button>
                        
                        <div className="toolbar-right">
                            <span className="model-selector">AI CourseGen v1 <span className="chevron">⌄</span></span>
                            <button 
                                type="submit" 
                                className="toolbar-submit-btn"
                                disabled={generating || !topic.trim()}
                            >
                                {generating ? <Loader2 className="spin" size={16} /> : <Play size={16} fill="currentColor" />}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Course List */}
            <div className="project-course-list">
                {project.courses && project.courses.length > 0 ? (
                    project.courses.map((courseSummary, index) => (
                        <div 
                            key={courseSummary.id || index} 
                            className="project-course-item"
                            onClick={() => navigate(`/course/${encodeURIComponent(courseSummary.title)}/${courseSummary.id}`)}
                        >
                            <h3 className="course-item-title">{courseSummary.title}</h3>
                            <p className="course-item-meta">
                                {courseSummary.moduleCount} Modules
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="empty-course-list">
                        <p>No courses generated yet. Type a topic above to begin.</p>
                    </div>
                )}
            </div>

        </div>
    );
}
