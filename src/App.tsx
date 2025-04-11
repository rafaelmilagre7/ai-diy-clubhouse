import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
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
import UserManagement from "@/pages/admin/UserManagement";
import NotFound from "@/pages/NotFound";

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

const AppRoutes = () => {
  const { profile, isAdmin } = useAuth();
  
  // If user is logged in and is admin, redirect to admin dashboard
  // Otherwise, redirect to member dashboard
  const homePath = isAdmin ? "/admin" : "/dashboard";

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to={homePath} replace />} />

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
        <Route path="/admin/users" element={<UserManagement />} />
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
