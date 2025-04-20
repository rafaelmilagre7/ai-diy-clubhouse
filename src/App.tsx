
import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ToasterProvider } from "@/components/layout/ToasterProvider";
import { AuthProvider } from "@/contexts/auth";
import { LoggingProvider } from "@/contexts/logging";
import LoadingScreen from "@/components/common/LoadingScreen";
import { ProtectedRoutes } from "@/auth/ProtectedRoutes";
import { AdminProtectedRoutes } from "@/auth/AdminProtectedRoutes";

// Lazy-loaded components
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const SetNewPassword = lazy(() => import("@/pages/auth/SetNewPassword"));
const MemberLayout = lazy(() => import("@/components/layout/MemberLayout"));
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
const AdminLayout = lazy(() => import("@/components/layout/AdminLayout"));
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
const Index = lazy(() => import("@/pages/Index"));
const RootRedirect = lazy(() => import("@/components/routing/RootRedirect"));

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
                {/* Landing e redirecionamento de raiz */}
                <Route path="/" element={<RootRedirect />} />
                <Route path="/index" element={<Index />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/reset-password/update" element={<SetNewPassword />} />

                {/* Protected Member Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoutes>
                    <MemberLayout>
                      <MemberDashboard />
                    </MemberLayout>
                  </ProtectedRoutes>
                } />
                
                <Route path="/solutions" element={
                  <ProtectedRoutes>
                    <MemberLayout>
                      <Solutions />
                    </MemberLayout>
                  </ProtectedRoutes>
                } />
                
                <Route path="/solutions/:id" element={
                  <ProtectedRoutes>
                    <MemberLayout>
                      <SolutionDetails />
                    </MemberLayout>
                  </ProtectedRoutes>
                } />
                
                <Route path="/implement/:id/:moduleIdx" element={
                  <ProtectedRoutes>
                    <MemberLayout>
                      <SolutionImplementation />
                    </MemberLayout>
                  </ProtectedRoutes>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoutes>
                    <MemberLayout>
                      <Profile />
                    </MemberLayout>
                  </ProtectedRoutes>
                } />
                
                <Route path="/tools" element={
                  <ProtectedRoutes>
                    <MemberLayout>
                      <Tools />
                    </MemberLayout>
                  </ProtectedRoutes>
                } />
                
                <Route path="/tools/:id" element={
                  <ProtectedRoutes>
                    <MemberLayout>
                      <ToolDetails />
                    </MemberLayout>
                  </ProtectedRoutes>
                } />
                
                <Route path="/suggestions" element={
                  <ProtectedRoutes>
                    <MemberLayout>
                      <Suggestions />
                    </MemberLayout>
                  </ProtectedRoutes>
                } />
                
                <Route path="/suggestions/:id" element={
                  <ProtectedRoutes>
                    <MemberLayout>
                      <SuggestionDetails />
                    </MemberLayout>
                  </ProtectedRoutes>
                } />
                
                <Route path="/suggestions/new" element={
                  <ProtectedRoutes>
                    <MemberLayout>
                      <NewSuggestion />
                    </MemberLayout>
                  </ProtectedRoutes>
                } />
                
                <Route path="/achievements" element={
                  <ProtectedRoutes>
                    <MemberLayout>
                      <Achievements />
                    </MemberLayout>
                  </ProtectedRoutes>
                } />

                {/* Protected Admin Routes */}
                <Route path="/admin" element={
                  <AdminProtectedRoutes>
                    <AdminLayout />
                  </AdminProtectedRoutes>
                }>
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
