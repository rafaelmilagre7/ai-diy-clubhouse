
import { useEffect, useState, useRef } from "react";
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
  const timeoutRef = useRef<number | null>(null);
  const isMounted = useRef(true);

  // Setup component lifecycle
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Setup loading timeout effect
  useEffect(() => {
    if (isLoading && isMounted.current) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        if (isMounted.current) {
          setLoadingTimeout(true);
        }
      }, 400); // Very short timeout
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [isLoading]);
  
  // Handle timeout and redirect to auth if needed
  useEffect(() => {
    if (loadingTimeout && isLoading && isMounted.current) {
      console.log("LayoutProvider: Loading timeout exceeded, redirecting to /auth");
      setIsLoading(false);
      navigate('/auth', { replace: true });
    }
  }, [loadingTimeout, isLoading, navigate, setIsLoading]);

  // Check user role when profile is loaded
  useEffect(() => {
    if (!profile || redirectChecked || !isMounted.current) {
      return;
    }
    
    if (profile.role === 'admin') {
      console.log("LayoutProvider: User is admin, redirecting to /admin");
      
      toast({
        title: "Redirecionando para área admin",
        description: "Você está sendo redirecionado para área administrativa."
      });
      
      navigate('/admin', { replace: true });
    } else {
      console.log("LayoutProvider: User is member, staying on member layout");
    }
    
    setRedirectChecked(true);
  }, [profile, navigate, redirectChecked]);

  // Fast path for members - If we have user and profile, render immediately
  if (user && profile && !isAdmin) {
    return <MemberLayout />;
  }

  // Show loading screen while checking the session (but only if timeout not exceeded)
  if (isLoading && !loadingTimeout) {
    return <LoadingScreen message="Preparando seu dashboard..." />;
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
