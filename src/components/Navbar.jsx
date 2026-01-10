import { useAuth } from "../auth/AuthContext";
import { LogOut, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    return (
        <nav className="navbar">
            <div className="brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                <LayoutDashboard className="brand-icon" /> AI CourseGen
            </div>
            <div className="nav-actions">
                <button className="nav-btn logout" onClick={logout}>
                    <LogOut size={18} /> Logout
                </button>
            </div>

            <style>{`
        .navbar {
          height: 70px;
          border-bottom: 1px solid var(--border-color);
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .brand {
          font-weight: 700;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
        }
        .brand-icon { color: var(--primary-color); }
        
        .nav-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }
        .nav-btn:hover {
           background: rgba(255,255,255,0.05);
           color: white;
        }
        .nav-btn.logout:hover { color: #f87171; background: rgba(248, 113, 113, 0.1); }
      `}</style>
        </nav>
    );
}
