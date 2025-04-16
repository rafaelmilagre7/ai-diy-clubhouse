
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
import Auth from "@/pages/Auth";
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
  const { user, isAdmin, isLoading, setIsLoading } = useAuth();
  const navigate = useNavigate();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Fast pass - se já temos usuário, mostrar conteúdo imediatamente
  if (user && !requireAdmin) {
    return <>{children}</>;
  }
  
  if (user && requireAdmin && isAdmin) {
    return <>{children}</>;
  }
  
  // Configurar timeout para carregamento com tempo extremamente reduzido
  useEffect(() => {
    if (isLoading) {
      const timeoutId = setTimeout(() => {
        console.log("ProtectedRoute: Tempo limite de carregamento excedido");
        setLoadingTimeout(true);
        setIsLoading(false);
        navigate('/auth', { replace: true });
      }, 500); // Timeout reduzido para 500ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, navigate, setIsLoading]);

  if (isLoading && !loadingTimeout) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Helper component to handle route redirection
const RootRedirect = () => {
  const { user, profile, isAdmin, isLoading, setIsLoading } = useAuth();
  const navigate = useNavigate();
  const [timeoutExceeded, setTimeoutExceeded] = useState(false);
  
  // Fast pass - redirecionar rapidamente se já temos as informações
  if (user && profile) {
    if (profile.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading && !timeoutExceeded) {
        console.log("RootRedirect: Tempo limite de carregamento excedido, redirecionando para /auth");
        setTimeoutExceeded(true);
        setIsLoading(false);
        navigate('/auth', { replace: true });
      }
    }, 500); // Reduzido para 500ms
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, navigate, timeoutExceeded, setIsLoading]);
  
  if (timeoutExceeded) {
    return null;
  }
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => {
  return (
    <AuthSession>
      <Routes>
        {/* Public routes that don't require authentication */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/index" element={<Index />} />

        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Member routes - within Layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<MemberDashboard />} />
          <Route path="solution/:id" element={<SolutionDetails />} />
          <Route path="implement/:id/:moduleIndex" element={<SolutionImplementation />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin routes - within AdminLayout */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="solutions" element={<SolutionsList />} />
          <Route path="solutions/new" element={<SolutionEditor />} />
          <Route path="solutions/:id" element={<SolutionEditor />} />
          <Route path="analytics/solution/:id" element={<SolutionMetrics />} />
          <Route path="users" element={<UserManagement />} />
        </Route>

        {/* 404 route */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </AuthSession>
  );
};

const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1, // Manter número reduzido de tentativas
        staleTime: 1000 * 60 * 5, // 5 minutos de cache
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
