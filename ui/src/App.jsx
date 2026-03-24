import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LoginPage from "./views/pages/LoginPage";
import Dashboard from "./views/pages/Dashboard";
import CreateCoursePage from "./views/pages/create-course/CreateCoursePage";
import CourseDetailsPage from "./views/pages/course/CourseDetailsPage";
import LessonPage from "./views/pages/course/LessonPage";
import ProtectedRoute from "./auth/ProtectedRoute";
import ProtectedLayout from "./views/layouts/ProtectedLayout";
import OAuthSuccessPage from "./views/pages/OAuthSuccessPage";
import LeaderboardPage from "./views/pages/LeaderboardPage";
import ProfilePage from "./views/pages/ProfilePage";
import ProjectsDashboard from "./views/pages/ProjectsDashboard";
import ProjectDetailsPage from "./views/pages/ProjectDetailsPage";
import CourseJoinPage from "./views/pages/CourseJoinPage";
import SharingPage from "./views/pages/SharingPage";

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 1500,
          style: {
            fontSize: '0.9rem',
            padding: '8px 16px',
            maxWidth: '400px',

            background: 'var(--text-primary)',
            color: 'var(--accent)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
          }
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />
        <Route path="/oauth-success" element={<OAuthSuccessPage />} />
        <Route path="/join/:token" element={<CourseJoinPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ProtectedLayout />
            </ProtectedRoute>
          }
        >
          {/* Default dashboard is now Courses */}
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<ProjectsDashboard />} />
          <Route path="project/:id" element={<ProjectDetailsPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="create-course" element={<CreateCoursePage />} />
          <Route path="course/:id" element={<CourseDetailsPage />} />
          <Route path="course/:id/sharing" element={<SharingPage />} />
          <Route path="course/:title/:id" element={<CourseDetailsPage />} />
          <Route path="course/:courseId/module/:moduleId/lesson/:lessonId" element={<LessonPage />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
