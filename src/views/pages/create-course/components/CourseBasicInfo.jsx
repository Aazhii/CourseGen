import React from "react";

export default function CourseBasicInfo({ topic, setTopic }) {
    return (
        <div className="form-group">
            <label>Topic</label>
            <input
                type="text"
                placeholder="e.g. Introduction to Python, Advanced React Patterns..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
            />
        </div>
    );
}
