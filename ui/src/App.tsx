import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { FeatureProvider } from "@/context/FeatureContext";
import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginExample";
import LandingPage from "./pages/LandingPage";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const LessonView = lazy(() => import("./pages/LessonView"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const CreateCourse = lazy(() => import("./pages/CreateCourse"));
const ShareCourse = lazy(() => import("./pages/ShareCourse"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const RegisterPage = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const JoinCourse = lazy(() => import("./pages/JoinCourse"));
const Notifications = lazy(() => import("./pages/Notifications"));
const AiCoach = lazy(() => import("./pages/AiCoach"));
const LlmAdmin = lazy(() => import("./pages/LlmAdmin"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <FeatureProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<div className="min-h-screen bg-background" />}>
                <Routes>
                  <Route path="/" element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />
                  <Route path="/welcome" element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />
                  <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
                  <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
                  <Route path="/join/:token" element={<JoinCourse />} />
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
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
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </FeatureProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
