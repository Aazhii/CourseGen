import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "../api/authApi";
import { useAuth } from "../auth/AuthContext";
import OAuthButtons from "../components/OAuthButtons";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const auth = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const token = await loginApi(form);
      auth.login(token);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials");
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">Login</h1>

        {error && <p className="error-text">{error}</p>}

        <input
          placeholder="Username"
          onChange={e => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={e => setForm({ ...form, password: e.target.value })}
        />

        <button className="submit-btn">Login</button>

        <OAuthButtons />
      </form>
    </div>
  );
}
