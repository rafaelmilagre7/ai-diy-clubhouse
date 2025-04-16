
import { useState, useEffect, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";

const RootRedirect = () => {
  const { user, profile, isAdmin, isLoading, setIsLoading } = useAuth();
  const navigate = useNavigate();
  const [timeoutExceeded, setTimeoutExceeded] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  
  // Handle timing out the loading state - always runs
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (isLoading && !timeoutExceeded) {
      timeoutRef.current = window.setTimeout(() => {
        console.log("RootRedirect: Loading timeout exceeded, redirecting to /auth");
        setTimeoutExceeded(true);
        setIsLoading(false);
        navigate('/auth', { replace: true });
      }, 2000); // Longer timeout for better UX
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, navigate, timeoutExceeded, setIsLoading]);
  
  // Handle redirection based on user state - always runs
  useEffect(() => {
    if (user && profile && !isLoading) {
      console.log("RootRedirect: User and profile available, redirecting");
      if (profile.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, profile, navigate, isLoading]);
  
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

export default RootRedirect;
