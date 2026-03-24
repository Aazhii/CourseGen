import React, { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { createCourse } from "../../../services/courseApi";

// Modular Components
import CourseBasicInfo from "./components/CourseBasicInfo";
import CourseSettings from "./components/CourseSettings";
import CourseSubmitAction from "./components/CourseSubmitAction";
import { useFeature } from "../../../hooks/useFeature";
import FeatureLimitBanner from "../../components/FeatureLimitBanner";

export default function CreateCoursePage() {
    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState("Beginner");
    const [duration, setDuration] = useState("2 Hours");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { courses = [], loadCourses } = useOutletContext();
    
    // Feature Limit Flag
    const { allowed, limit, usage, isUnlimited, atLimit, loading: featureLoading } = useFeature("COURSE_CREATE");

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const formPayload = {
                title: topic,
                difficulty,
                duration
            };
            const res = await createCourse(formPayload);
            
            // Instantly refresh the parent layout's course list
            await loadCourses();
            
            // Navigate to the newly generated course
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

                <FeatureLimitBanner 
                    limit={limit} 
                    isUnlimited={isUnlimited} 
                    currentCount={usage} 
                    featureName="course" 
                />

                <form onSubmit={handleSubmit}>
                    <CourseBasicInfo topic={topic} setTopic={setTopic} />
                    <CourseSettings 
                        difficulty={difficulty} setDifficulty={setDifficulty} 
                        duration={duration} setDuration={setDuration} 
                    />
                    <CourseSubmitAction 
                        loading={loading} 
                        atLimit={atLimit} 
                        allowed={allowed} 
                        featureLoading={featureLoading} 
                    />
                </form>
            </div>
        </div>
    );
}
