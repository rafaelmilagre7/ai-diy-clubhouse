
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/hooks/use-toast";

export const useLayoutAuthentication = () => {
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
  
  // Setup loading timeout effect with a longer delay for better UX
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
      }, 2000); // Longer timeout for better UX
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
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

  return {
    user,
    profile,
    isAdmin,
    isLoading,
    loadingTimeout,
    redirectChecked
  };
};
