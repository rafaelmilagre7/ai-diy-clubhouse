import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/auth";
import AuthSession from "@/components/auth/AuthSession";
import Layout from "@/components/layout/Layout";
import AdminLayout from "@/components/layout/AdminLayout";
import LoadingScreen from "@/components/common/LoadingScreen";

// Member routes
import Login from "@/pages/Login";
import MemberDashboard from "@/pages/member/Dashboard";
import SolutionDetails from "@/pages/member/SolutionDetails";
import SolutionImplementation from "@/pages/member/SolutionImplementation";
import Profile from "@/pages/member/Profile";

// Admin routes
import AdminDashboard from "@/pages/admin/Dashboard";
import SolutionsList from "@/pages/admin/SolutionsList";
import SolutionEditor from "@/pages/admin/SolutionEditor";
import SolutionMetrics from "@/pages/admin/SolutionMetrics";
import UserManagement from "@/pages/admin/UserManagement";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";

const queryClient = new QueryClient();

// Route guard for authenticated routes
const ProtectedRoute = ({ 
  children, 
  requireAdmin = false
}: { 
  children: React.ReactNode;
  requireAdmin?: boolean;
}) => {
  const { user, profile, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Route guard that redirects authenticated users
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Move AppRoutes inside App to ensure it has access to AuthProvider
const App = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthSession>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } />
                
                <Route path="/index" element={<Index />} />

                {/* Root redirect */}
                <Route path="/" element={<AppRoutes />} />

                {/* Member routes - within Layout */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route path="/dashboard" element={<MemberDashboard />} />
                  <Route path="/solution/:id" element={<SolutionDetails />} />
                  <Route path="/implement/:id/:moduleIndex" element={<SolutionImplementation />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Admin routes - within AdminLayout */}
                <Route path="/admin" element={
                  <ProtectedRoute requireAdmin>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="/admin/solutions" element={<SolutionsList />} />
                  <Route path="/admin/solutions/new" element={<SolutionEditor />} />
                  <Route path="/admin/solutions/:id" element={<SolutionEditor />} />
                  <Route path="/admin/analytics/solution/:id" element={<SolutionMetrics />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                </Route>

                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthSession>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

// Helper component to handle route redirection
const AppRoutes = () => {
  const { profile, isAdmin } = useAuth();
  
  // If user is logged in and is admin, redirect to admin dashboard
  // Otherwise, redirect to member dashboard
  const homePath = isAdmin ? "/admin" : "/dashboard";
  
  return <Navigate to={homePath} replace />;
};

export default App;
