import React, { useState } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import CreateProjectModal from "../components/CreateProjectModal";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Enable relative time for "Updated X days ago"
dayjs.extend(relativeTime);

export default function ProjectsDashboard() {
    const navigate = useNavigate();
    const { projects, projectsLoading, loadProjects } = useOutletContext();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("Activity");
    
    // Modal State
    const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

    const filteredProjects = projects.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="projects-dashboard fade-up">
            <div className="projects-dashboard-header">
                <h1 className="projects-title">Projects</h1>
                <button className="new-project-btn" onClick={() => setIsCreateProjectOpen(true)}>
                    <Plus size={16} /> New project
                </button>
            </div>

            <div className="projects-search-bar">
                <Search size={18} className="search-icon" />
                <input 
                    type="text" 
                    placeholder="Search projects..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="projects-controls">
                <span className="sort-label">Sort by</span>
                <select 
                    className="projects-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="Activity">Activity</option>
                    <option value="Name">Name</option>
                </select>
            </div>

            {projectsLoading ? (
                <div className="projects-loading">
                    <Loader2 className="spin" size={32} />
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="empty-projects">
                    <p>No projects found.</p>
                </div>
            ) : (
                <div className="projects-grid">
                    {filteredProjects.map(project => (
                        <div 
                            key={project.id} 
                            className="project-card"
                            onClick={() => navigate(`/project/${project.id}`)}
                        >
                            <h3 className="project-card-name" title={project.name}>{project.name}</h3>
                            {project.description && (
                                <p className="project-card-desc">{project.description}</p>
                            )}
                            <div className="project-card-footer">
                                <span>Updated {dayjs(project.createdAt).fromNow()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Project Modal */}
            <CreateProjectModal 
                isOpen={isCreateProjectOpen} 
                onClose={() => setIsCreateProjectOpen(false)}
                onProjectCreated={() => {
                    if (loadProjects) loadProjects();
                }}
            />
        </div>
    );
}
