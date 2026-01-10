import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function ProtectedLayout() {
    return (
        <div className="dashboard-layout">
            <Navbar />
            <main className="main-content">
                <Outlet />
            </main>


        </div>
    );
}
