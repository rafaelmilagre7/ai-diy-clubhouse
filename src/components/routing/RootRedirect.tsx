
import { useState, useEffect, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";

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

export default RootRedirect;
