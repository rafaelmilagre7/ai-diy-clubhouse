
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
import { useEffect, useState, useRef } from "react";

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
  const timeoutRef = useRef<number | null>(null);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Handle loading timeout
  useEffect(() => {
    if (isLoading) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        console.log("ProtectedRoute: Loading timeout exceeded");
        setLoadingTimeout(true);
        setIsLoading(false);
        navigate('/auth', { replace: true });
      }, 2000); // Longer timeout for better UX
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [isLoading, navigate, setIsLoading]);

  // Handle rendering based on auth state
  if (isLoading && !loadingTimeout) {
    return <LoadingScreen message="Verificando sua autenticação..." />;
  }

  // Centralize all navigation logic in one useEffect to prevent conditional hook calls
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        console.log("ProtectedRoute: No user, redirecting to auth");
        navigate('/auth', { replace: true });
      } else if (requireAdmin && !isAdmin) {
        console.log("ProtectedRoute: User is not admin, redirecting to dashboard");
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, isAdmin, isLoading, requireAdmin, navigate]);

  // Only render children if conditions are met
  if (user && ((!requireAdmin) || (requireAdmin && isAdmin))) {
    return <>{children}</>;
  }

  // Return empty fragment while navigation happens
  return <LoadingScreen message="Redirecionando..." />;
};

// Helper component to handle route redirection
const RootRedirect = () => {
  const { user, profile, isAdmin, isLoading, setIsLoading } = useAuth();
  const navigate = useNavigate();
  const [timeoutExceeded, setTimeoutExceeded] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  
  // Handle timing out the loading state
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      if (isLoading && !timeoutExceeded) {
        console.log("RootRedirect: Loading timeout exceeded, redirecting to /auth");
        setTimeoutExceeded(true);
        setIsLoading(false);
        navigate('/auth', { replace: true });
      }
    }, 2000); // Longer timeout for better UX
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, navigate, timeoutExceeded, setIsLoading]);
  
  // Always render something, but determine what based on conditions
  useEffect(() => {
    // Handle immediate redirection if user and profile are available
    if (user && profile) {
      console.log("RootRedirect: User and profile available, redirecting");
      if (profile.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, profile, navigate]);
  
  // Show loading screen during check
  if (isLoading && !timeoutExceeded) {
    return <LoadingScreen message="Preparando sua experiência..." />;
  }
  
  // Default redirects based on authentication state
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

// Main routes component
const AppRoutes = () => {
  return (
    <AuthSession>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/index" element={<Index />} />
        <Route path="/" element={<RootRedirect />} />
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
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthSession>
  );
};

// Main App component
const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 1000 * 60 * 5,
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
