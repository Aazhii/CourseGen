import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import CreateCoursePage from "./pages/course/CreateCoursePage";
import CourseDetailsPage from "./pages/course/CourseDetailsPage";
import ProtectedRoute from "./auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-course"
        element={
          <ProtectedRoute>
            <CreateCoursePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/course/:id"
        element={
          <ProtectedRoute>
            <CourseDetailsPage />
          </ProtectedRoute>
        }
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
