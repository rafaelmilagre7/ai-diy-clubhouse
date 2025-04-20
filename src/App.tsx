
import { useState, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ToasterProvider } from "@/components/layout/ToasterProvider";
import { ProtectedRoutes } from "@/auth/ProtectedRoutes";
import { AdminProtectedRoutes } from "@/auth/AdminProtectedRoutes";
import { AuthProvider } from "@/contexts/auth";
import { LoggingProvider } from "@/contexts/logging";
import LoadingScreen from "@/components/common/LoadingScreen";

// Lazy-loaded components
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const SetNewPassword = lazy(() => import("@/pages/auth/SetNewPassword"));
const MemberLayout = lazy(() => import("@/components/layout/member/MemberLayout"));
const MemberDashboard = lazy(() => import("@/pages/member/Dashboard"));
const Solutions = lazy(() => import("@/pages/member/Solutions"));
const SolutionDetails = lazy(() => import("@/pages/member/SolutionDetails"));
const SolutionImplementation = lazy(() => import("@/pages/member/SolutionImplementation"));
const Profile = lazy(() => import("@/pages/member/Profile"));
const Tools = lazy(() => import("@/pages/member/Tools"));
const ToolDetails = lazy(() => import("@/pages/member/ToolDetails"));
const Suggestions = lazy(() => import("@/pages/member/Suggestions"));
const SuggestionDetails = lazy(() => import("@/pages/member/SuggestionDetails"));
const NewSuggestion = lazy(() => import("@/pages/member/NewSuggestion"));
const Achievements = lazy(() => import("@/pages/member/Achievements"));
const AdminLayout = lazy(() => import("@/components/layout/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminSolutions = lazy(() => import("@/pages/admin/AdminSolutions"));
const AdminSolutionEdit = lazy(() => import("@/pages/admin/AdminSolutionEdit"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));
const AdminTools = lazy(() => import("@/pages/admin/AdminTools"));
const AdminToolEdit = lazy(() => import("@/pages/admin/AdminToolEdit"));
const AdminSuggestions = lazy(() => import("@/pages/admin/AdminSuggestions"));
const AdminSuggestionDetails = lazy(() => import("@/pages/admin/AdminSuggestionDetails"));
const SolutionEditor = lazy(() => import("@/pages/admin/SolutionEditor"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <LoggingProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/reset-password/update" element={<SetNewPassword />} />

                {/* Protected Member Routes */}
                <Route element={<ProtectedRoutes />}>
                  <Route path="/" element={<MemberLayout />}>
                    <Route index element={<MemberDashboard />} />
                    <Route path="solutions" element={<Solutions />} />
                    <Route path="solutions/:id" element={<SolutionDetails />} />
                    <Route path="implement/:id/:moduleIdx" element={<SolutionImplementation />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="tools" element={<Tools />} />
                    <Route path="tools/:id" element={<ToolDetails />} />
                    <Route path="suggestions" element={<Suggestions />} />
                    <Route path="suggestions/:id" element={<SuggestionDetails />} />
                    <Route path="suggestions/new" element={<NewSuggestion />} />
                    <Route path="achievements" element={<Achievements />} />
                  </Route>
                </Route>

                {/* Protected Admin Routes */}
                <Route element={<AdminProtectedRoutes />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="solutions" element={<AdminSolutions />} />
                    <Route path="solutions/new" element={<AdminSolutionEdit />} />
                    <Route path="solutions/:id" element={<AdminSolutionEdit />} />
                    <Route path="solutions/:id/editor" element={<SolutionEditor />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="tools" element={<AdminTools />} />
                    <Route path="tools/new" element={<AdminToolEdit />} />
                    <Route path="tools/:id" element={<AdminToolEdit />} />
                    <Route path="suggestions" element={<AdminSuggestions />} />
                    <Route path="suggestions/:id" element={<AdminSuggestionDetails />} />
                  </Route>
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Router>
          <Toaster />
          <ToasterProvider />
        </QueryClientProvider>
      </LoggingProvider>
    </AuthProvider>
  );
}

export default App;
