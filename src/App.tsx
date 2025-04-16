
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/auth";
import AuthSession from "@/components/auth/AuthSession";
import Layout from "@/components/layout/Layout";
import AdminLayout from "@/components/layout/AdminLayout";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useEffect, useState } from "react";

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

// Route guard for authenticated routes
const ProtectedRoute = ({ 
  children, 
  requireAdmin = false
}: { 
  children: React.ReactNode;
  requireAdmin?: boolean;
}) => {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    console.log("ProtectedRoute: Usuário não autenticado, redirecionando para login");
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    console.log("ProtectedRoute: Tentativa de acesso à área admin por não-admin, redirecionando", { 
      isAdmin,
      role: isAdmin ? 'admin' : 'member' 
    });
    return <Navigate to="/dashboard" replace />;
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
    console.log("PublicRoute: Usuário já autenticado, redirecionando para home");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

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
                {/* Public routes that don't require authentication */}
                <Route path="/login" element={<Login />} />
                <Route path="/index" element={<Index />} />

                {/* Root redirect */}
                <Route path="/" element={<RootRedirect />} />

                {/* Member routes - within Layout */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<MemberDashboard />} />
                  <Route path="/dashboard/solution/:id" element={<SolutionDetails />} />
                  <Route path="/dashboard/implement/:id/:moduleIndex" element={<SolutionImplementation />} />
                  <Route path="/dashboard/profile" element={<Profile />} />
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
                <Route path="*" element={<Navigate to="/index" replace />} />
              </Routes>
            </AuthSession>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

// Helper component to handle route redirection
const RootRedirect = () => {
  const { user, profile, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [timeoutExceeded, setTimeoutExceeded] = useState(false);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading && !timeoutExceeded) {
        console.log("RootRedirect: Tempo limite de carregamento excedido, redirecionando para /index");
        setTimeoutExceeded(true);
        navigate('/index', { replace: true });
      }
    }, 3000); // 3 segundos é suficiente
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, navigate, timeoutExceeded]);
  
  // If timeout exceeded, return null to avoid rendering
  if (timeoutExceeded) {
    return null;
  }
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    console.log("RootRedirect: Usuário não autenticado, redirecionando para login");
    return <Navigate to="/login" replace />;
  }
  
  if (!profile) {
    console.log("RootRedirect: Perfil não encontrado, redirecionando para /index");
    return <Navigate to="/index" replace />;
  }
  
  const homePath = profile.role === 'admin' ? '/admin' : '/dashboard';
  
  console.log("RootRedirect: redirecionando usuário para", homePath, { 
    role: profile.role || 'não definido',
    isAdmin
  });
  
  return <Navigate to={homePath} replace />;
};

export default App;
