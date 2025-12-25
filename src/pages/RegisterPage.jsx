import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/authApi";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    await register(form);
    navigate("/login");
  }

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className="auth-title">Register</h1>

        <input
          placeholder="Username"
          onChange={e => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={e => setForm({ ...form, password: e.target.value })}
        />

        <button className="submit-btn">Create Account</button>
      </form>
    </div>
  );
}
