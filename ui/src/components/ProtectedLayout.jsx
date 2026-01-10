import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function ProtectedLayout() {
    return (
        <div className="dashboard-layout">
            <Navbar />
            <main className="main-content">
                <Outlet />
            </main>

            <style>{`
        .dashboard-layout {
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .main-content {
           padding: 2rem;
           max-width: 1200px;
           margin: 0 auto;
           width: 100%;
           flex: 1;
        }
      `}</style>
        </div>
    );
}
