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


        </nav>
    );
}
