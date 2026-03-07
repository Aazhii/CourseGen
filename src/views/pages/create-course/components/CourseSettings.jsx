import React from "react";

export default function CourseSettings({ difficulty, setDifficulty, duration, setDuration }) {
    return (
        <div className="grid-2">
            <div className="form-group">
                <label>Difficulty</label>
                <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </select>
            </div>

            <div className="form-group">
                <label>Duration</label>
                <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                >
                    <option value="1 Hour">1 Hour</option>
                    <option value="2 Hours">2 Hours</option>
                    <option value="5+ Hours">5+ Hours</option>
                </select>
            </div>
        </div>
    );
}
