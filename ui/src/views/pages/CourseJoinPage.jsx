import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resolveShareToken, enrollUsingShareLink } from "../../services/joinApi";
import { Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function CourseJoinPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [shareData, setShareData] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchTokenInfo = async () => {
            try {
                const data = await resolveShareToken(token);
                setShareData(data);
            } catch (err) {
                setError(err.message || "Invalid or expired share link.");
            } finally {
                setLoading(false);
            }
        };
        fetchTokenInfo();
    }, [token]);

    const handleEnroll = async () => {
        setEnrolling(true);
        try {
            await enrollUsingShareLink(token);
            setSuccess(true);
            toast.success("Successfully enrolled in the course!");
            setTimeout(() => {
                navigate(`/course/${shareData.courseId}`);
            }, 2000);
        } catch (err) {
            toast.error(err.message || "Failed to enroll. You might already be enrolled.");
            setEnrolling(false);
        }
    };

    if (loading) {
        return (
            <div className="center" style={{ height: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <Loader2 className="spin" size={40} style={{ color: "var(--accent)", marginBottom: "1rem" }} />
                <p>Resolving share link...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="center" style={{ height: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ color: "#ef4444", fontSize: "1.2rem", marginBottom: "1rem" }}>{error}</div>
                <button className="auth-btn" onClick={() => navigate("/")} style={{ width: "auto", padding: "10px 20px" }}>
                    Go to Dashboard
                </button>
            </div>
        );
    }

    if (success) {
        return (
            <div className="center" style={{ height: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle size={60} style={{ color: "#10b981", marginBottom: "1rem" }} />
                <h2 style={{ marginBottom: "1rem" }}>Enrollment Successful!</h2>
                <p className="text-muted">Redirecting you to the course...</p>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: "600px",
            margin: "4rem auto",
            padding: "2rem",
            background: "var(--bg-secondary)",
            borderRadius: "1rem",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            textAlign: "center"
        }}>
            <h1 className="course-title-large" style={{ marginBottom: "0.5rem", fontSize: "2rem" }}>You have been invited!</h1>
            <p className="text-muted" style={{ marginBottom: "2rem" }}>
                You have received an invitation to join a course.
            </p>

            <div style={{
                background: "var(--bg-primary)",
                padding: "2rem",
                borderRadius: "0.5rem",
                marginBottom: "2rem",
                border: "1px solid var(--border-color)"
            }}>
                <h2 style={{ fontSize: "1.5rem", margin: "0 0 1rem 0", color: "var(--text-primary)" }}>Join the course</h2>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", color: "var(--text-secondary)" }}>
                    {shareData?.CourseTitle || "Course Invitation"}
                </div>
            </div>

            <button
                className="auth-btn"
                onClick={handleEnroll}
                disabled={enrolling}
                style={{ width: "100%", padding: "1rem", fontSize: "1.1rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}
            >
                {enrolling ? <Loader2 className="spin" size={20} /> : null}
                {enrolling ? "Enrolling..." : "Enroll Now"}
            </button>
            
            <button
                className="auth-btn outline"
                onClick={() => navigate("/")}
                style={{ width: "100%", padding: "1rem", fontSize: "1.1rem", marginTop: "1rem", background: "transparent", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
            >
                Cancel
            </button>
        </div>
    );
}
