
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireAdmin = false 
}: ProtectedRouteProps) => {
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
        navigate('/login', { replace: true });
      }, 2000);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, navigate, setIsLoading]);

  // Navigation logic
  useEffect(() => {
    if (!isLoading && !loadingTimeout) {
      if (!user) {
        console.log("ProtectedRoute: No user, redirecting to login");
        navigate('/login', { replace: true });
      } else if (requireAdmin && !isAdmin) {
        console.log("ProtectedRoute: User is not admin, redirecting to dashboard");
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, isAdmin, isLoading, loadingTimeout, requireAdmin, navigate]);

  // Show loading screen during the loading state
  if (isLoading && !loadingTimeout) {
    return <LoadingScreen message="Verificando sua autenticação..." />;
  }

  // Only render children if conditions are met
  if (user && ((!requireAdmin) || (requireAdmin && isAdmin))) {
    return <>{children}</>;
  }

  // Return loading screen as fallback while navigation happens
  return <LoadingScreen message="Redirecionando..." />;
};

export default ProtectedRoute;
