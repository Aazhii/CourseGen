import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./views/pages/LoginPage";
import Dashboard from "./views/pages/Dashboard";
import CreateCoursePage from "./views/pages/course/CreateCoursePage";
import CourseDetailsPage from "./views/pages/course/CourseDetailsPage";
import LessonPage from "./views/pages/course/LessonPage";
import ProtectedRoute from "./auth/ProtectedRoute";
import ProtectedLayout from "./views/layouts/ProtectedLayout";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ProtectedLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="create-course" element={<CreateCoursePage />} />
        <Route path="course/:id" element={<CourseDetailsPage />} />
        <Route path="course/:title/:id" element={<CourseDetailsPage />} />
        <Route path="course/:courseId/module/:moduleId/lesson/:lessonId" element={<LessonPage />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
