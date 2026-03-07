import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { createProject } from "../../services/projectApi";
import { useNavigate } from "react-router-dom";

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Project name is required.");
            return;
        }

        try {
            setLoading(true);
            const res = await createProject({ name, description });
            
            // Notify parent to refresh layouts if necessary
            if (onProjectCreated) await onProjectCreated();

            // Reset form
            setName("");
            setDescription("");
            onClose();

            // Auto-navigate into the newly created project view
            navigate(`/project/${res.id}`);
        } catch (err) {
            console.error("Failed to create project:", err);
            setError(err.message || "Failed to create project.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-modal-overlay">
            <div className="project-modal-card fade-up">
                
                <h2 className="project-modal-title">Create a personal project</h2>
                
                <form onSubmit={handleSubmit}>
                    {error && <div className="settings-error" style={{ marginBottom: '1rem' }}>{error}</div>}

                    <div className="project-form-group">
                        <label>What are you working on?</label>
                        <input 
                            type="text"
                            placeholder="Name your project"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                            required
                            className="project-input"
                        />
                    </div>

                    <div className="project-form-group">
                        <label>What are you trying to achieve?</label>
                        <textarea 
                            placeholder="Describe your project, goals, subject, etc..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="project-textarea"
                            rows={4}
                        />
                    </div>

                    <div className="project-modal-actions">
                        <button 
                            type="button" 
                            className="project-cancel-btn"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="project-create-btn"
                            disabled={loading || !name.trim()}
                        >
                            {loading ? <Loader2 className="spin" size={16} /> : "Create project"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
