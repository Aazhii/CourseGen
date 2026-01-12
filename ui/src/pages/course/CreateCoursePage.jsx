import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCourse } from "../../api/courseApi";
import { Loader2, Sparkles } from "lucide-react";

export default function CreateCoursePage() {
    const [form, setForm] = useState({
        title: "",
        difficulty: "Beginner",
        duration: "2 Hours" // Maps to "Short", "Medium", "Long" if needed, keeping simple for now
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            // Mapping "duration" string to something the backend might expect, or just sending as is
            // Assuming backend expects: { topic, difficulty, duration }
            const res = await createCourse(form);
            // Assuming res returns the created course object with an ID
            navigate(`/course/${encodeURIComponent(res.title)}/${res.id}`);
        } catch (err) {
            console.error(err);
            alert("Failed to generate course. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="create-course-container">
            <div className="create-card">
                <h1 className="page-title">
                    <Sparkles className="icon-sparkle" /> Create New Course
                </h1>
                <p className="page-subtitle">Enter a topic and let AI generate a curriculum for you.</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Topic</label>
                        <input
                            placeholder="e.g. Introduction to Python, Advanced React Patterns..."
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label>Difficulty</label>
                            <select
                                value={form.difficulty}
                                onChange={e => setForm({ ...form, difficulty: e.target.value })}
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Duration</label>
                            <select
                                value={form.duration}
                                onChange={e => setForm({ ...form, duration: e.target.value })}
                            >
                                <option value="1 Hour">1 Hour</option>
                                <option value="2 Hours">2 Hours</option>
                                <option value="5+ Hours">5+ Hours</option>
                            </select>
                        </div>
                    </div>

                    <button className="submit-btn generate-btn" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="spin" size={20} /> Generating...
                            </>
                        ) : (
                            "Generate Course"
                        )}
                    </button>
                </form>
            </div>


        </div>
    );
}
