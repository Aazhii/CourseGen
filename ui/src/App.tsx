import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/auth/AuthContext";
import { FeatureProvider } from "@/context/FeatureContext";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import CourseDetail from "./pages/CourseDetail";
import LessonView from "./pages/LessonView";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import CreateCourse from "./pages/CreateCourse";
import ShareCourse from "./pages/ShareCourse";
import Leaderboard from "./pages/Leaderboard";
import LoginPage from "./pages/LoginExample";
import RegisterPage from "./pages/Register";
import Profile from "./pages/Profile";
import JoinCourse from "./pages/JoinCourse";
import Notifications from "./pages/Notifications";
import AiCoach from "./pages/AiCoach";
import LlmAdmin from "./pages/LlmAdmin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <FeatureProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/join/:token" element={<JoinCourse />} />
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/courses/:courseId" element={<CourseDetail />} />
                  <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonView />} />
                  <Route path="/courses/:courseId/coach" element={<AiCoach />} />
                  <Route path="/courses/:courseId/lessons/:lessonId/coach" element={<AiCoach />} />
                  <Route path="/courses/:courseId/share" element={<ShareCourse />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:projectId" element={<ProjectDetail />} />
                  <Route path="/create-course" element={<CreateCourse />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/admin/llm" element={<LlmAdmin />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </FeatureProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
