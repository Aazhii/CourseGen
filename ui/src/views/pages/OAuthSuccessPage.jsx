import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function OAuthSuccessPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const auth = useAuth();
    const [status, setStatus] = useState("verifying");

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            setStatus("success");
            // Add a small delay so the user sees the success state
            setTimeout(() => {
                auth.login(token);
                navigate("/", { replace: true });
            }, 1000);
        } else {
            setStatus("error");
            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 2000);
        }
    }, [searchParams, auth, navigate]);

    return (
        <div
            className="auth-container"
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                background: "transparent", // No extra background
                padding: 0
            }}
        >
            <div
                style={{
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "1.5rem",
                    animation: "fadeIn 0.5s ease-in-out"
                }}
            >
                {status === "verifying" && (
                    <>
                        <Loader2 className="spin" size={60} style={{ color: "#6366f1" }} />
                        <div>
                            <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#fff", marginBottom: "0.5rem" }}>
                                Verifying
                            </h2>
                            <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>Securing your session...</p>
                        </div>
                    </>
                )}

                {status === "success" && (
                    <>
                        <CheckCircle size={60} style={{ color: "#10b981" }} />
                        <div>
                            <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#fff", marginBottom: "0.5rem" }}>
                                Success
                            </h2>
                            <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>Redirecting to dashboard...</p>
                        </div>
                    </>
                )}

                {status === "error" && (
                    <>
                        <AlertCircle size={60} style={{ color: "#ef4444" }} />
                        <div>
                            <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "#fff", marginBottom: "0.5rem" }}>
                                Authentication Failed
                            </h2>
                            <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>Please log in again.</p>
                        </div>
                    </>
                )}
            </div>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
