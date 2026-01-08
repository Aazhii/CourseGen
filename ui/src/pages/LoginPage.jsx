import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login as loginApi, register as registerApi } from "../api/authApi";
import { useAuth } from "../auth/AuthContext";
import OAuthButtons from "../components/OAuthButtons";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  // Set initial mode based on URL
  useEffect(() => {
    if (location.pathname === "/register") {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [location.pathname]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // Login Logic
        const token = await loginApi(form);
        auth.login(token);
        navigate("/");
      } else {
        // Register Logic
        await registerApi(form);
        // Auto-switch to login or auto-login?
        // Let's auto-login for better UX if the backend allows, 
        // but typically we might ask them to login. 
        // For smoother UX, let's try to login immediately with the same creds
        try {
          const token = await loginApi(form);
          auth.login(token);
          navigate("/");
        } catch (loginErr) {
          // Fallback if auto-login fails
          setIsLogin(true);
          setError("Registration successful! Please login.");
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setIsLogin(!isLogin);
    setError("");
    // Update URL without full reload/navigation stack push if desired, 
    // or just let state handle it. 
    // To keep it simple and consistent with URL:
    navigate(isLogin ? "/register" : "/login");
  }

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">{isLogin ? "Welcome Back" : "Create Account"}</h1>

        {error && <p className="error-text">{error}</p>}

        <div className="form-group">
          <label>Username</label>
          <input
            placeholder="Enter your username"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
            minLength={4}
          />
        </div>

        <button className="submit-btn" disabled={loading}>
          {loading ? <Loader2 className="spin" /> : (isLogin ? "Sign In" : "Sign Up")}
        </button>

        <p className="hint-text">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span
            onClick={toggleMode}
            style={{
              color: "var(--primary-color)",
              fontWeight: "600",
              cursor: "pointer",
              textDecoration: "underline"
            }}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </span>
        </p>

        <OAuthButtons />
      </form>

      <style>{`
        .spin { animation: spin 1s linear infinite; margin: 0 auto; display: block; }
        .error-text {
            color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-bottom: 1.5rem;
            text-align: center;
            font-size: 0.9rem;
        }
        .form-group label {
            margin-bottom: 0.5rem;
            display: block;
            color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
