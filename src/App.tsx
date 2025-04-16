
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
  
  // Immediate pass through for authenticated users
  if (user && !requireAdmin) {
    return <>{children}</>;
  }
  
  if (user && requireAdmin && isAdmin) {
    return <>{children}</>;
  }
  
  // Handle loading timeout
  useEffect(() => {
    if (isLoading) {
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

  if (isLoading && !loadingTimeout) {
    return <LoadingScreen message="Verificando sua autenticação..." />;
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
  const timeoutRef = useRef<number | null>(null);
  const isMounted = useRef(true);
  
  // Clean up on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Handle immediate redirection if user and profile are available
  if (user && profile) {
    console.log("RootRedirect: User and profile available, redirecting");
    if (profile.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  // Handle loading timeout
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      if (isLoading && !timeoutExceeded && isMounted.current) {
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
  
  // Show nothing if timeout exceeded (navigation will happen)
  if (timeoutExceeded) {
    return null;
  }
  
  // Show loading screen during check
  if (isLoading) {
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
