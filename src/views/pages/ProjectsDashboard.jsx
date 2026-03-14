import React, { useState } from "react";
import { Search, Plus, Loader2, Trash2 } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import CreateProjectModal from "../components/CreateProjectModal";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useFeature } from "../../hooks/useFeature";
import FeatureLimitBanner from "../components/FeatureLimitBanner";
import FeatureRestrictedButton from "../components/FeatureRestrictedButton";
import { deleteProject } from "../../services/projectApi";
import { confirmDelete } from "../../utils/confirmDelete";
import toast from "react-hot-toast";

// Enable relative time for "Updated X days ago"
dayjs.extend(relativeTime);

export default function ProjectsDashboard() {
    const navigate = useNavigate();
    const { projects, projectsLoading, loadProjects } = useOutletContext();
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("Activity");
    
    // Feature Limit Flag
    const { allowed, limit, usage, isUnlimited, atLimit, loading: featureLoading } = useFeature("PROJECT_CREATE");

    const handleDeleteProject = (projectId, projectName) => {
        confirmDelete({
            title: `Delete "${projectName}"?`,
            description: "This action cannot be undone.",
            onConfirm: async () => {
                try {
                    await deleteProject(projectId);
                    toast.success(`"${projectName}" deleted.`);
                    if (loadProjects) loadProjects();
                } catch {
                    toast.error("Failed to delete project.");
                }
            },
        });
    };

    // Modal State
    const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

    const filteredProjects = projects
        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === "Name") {
                return a.name.localeCompare(b.name);
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

    return (
        <div className="projects-dashboard fade-up">
            <div className="projects-dashboard-header">
                <h1 className="projects-title">Projects</h1>
                <FeatureRestrictedButton 
                    className="new-project-btn" 
                    onClick={() => setIsCreateProjectOpen(true)}
                    allowed={allowed}
                    atLimit={atLimit}
                    loading={featureLoading}
                >
                    <Plus size={16} /> New project
                </FeatureRestrictedButton>
            </div>

            <FeatureLimitBanner 
                limit={limit} 
                isUnlimited={isUnlimited} 
                currentCount={usage} 
                featureName="project" 
            />

            <div className="projects-filter-row">
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
                            <div className="project-card-header">
                                <h3 className="project-card-name" title={project.name}>{project.name}</h3>
                                <button
                                    className="project-card-delete-btn"
                                    title="Delete project"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteProject(project.id, project.name);
                                    }}
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
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
