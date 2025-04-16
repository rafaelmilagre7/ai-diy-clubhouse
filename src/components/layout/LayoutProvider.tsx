
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/hooks/use-toast";
import LoadingScreen from "@/components/common/LoadingScreen";
import MemberLayout from "./MemberLayout";

/**
 * LayoutProvider handles authentication checks and role-based routing
 * before rendering the appropriate layout component
 */
const LayoutProvider = () => {
  const { user, profile, isAdmin, isLoading, setIsLoading } = useAuth();
  const navigate = useNavigate();
  const [redirectChecked, setRedirectChecked] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Setup loading timeout effect
  useEffect(() => {
    if (isLoading) {
      const timeoutId = setTimeout(() => {
        setLoadingTimeout(true);
      }, 500); // Reduced to 500ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading]);
  
  // Handle timeout and redirect to auth if needed
  useEffect(() => {
    if (loadingTimeout && isLoading) {
      console.log("LayoutProvider: Loading timeout exceeded, redirecting to /auth");
      setIsLoading(false);
      navigate('/auth', { replace: true });
    }
  }, [loadingTimeout, isLoading, navigate, setIsLoading]);

  // Check user role when profile is loaded
  useEffect(() => {
    if (!profile || redirectChecked) {
      return;
    }
    
    if (profile.role === 'admin') {
      console.log("LayoutProvider: User is admin, redirecting to /admin");
      
      toast({
        title: "Redirecting to admin area",
        description: "You are being redirected to the admin area."
      });
      
      navigate('/admin', { replace: true });
    }
    
    setRedirectChecked(true);
  }, [profile, navigate, redirectChecked]);

  // Render different layouts based on conditions
  // Fast path for members - If we have user and profile, render immediately
  if (user && profile && !isAdmin) {
    return <MemberLayout />;
  }

  // Show loading screen while checking the session (but only if timeout not exceeded)
  if (isLoading && !loadingTimeout) {
    return <LoadingScreen />;
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user is admin, redirect to admin layout
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Default case: Render the member layout
  return <MemberLayout />;
};

export default LayoutProvider;
