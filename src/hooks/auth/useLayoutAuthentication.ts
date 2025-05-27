
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

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
  }, [user, profile, isAdmin, isLoading]);
  
  // Setup loading timeout effect com tempo mais curto
  useEffect(() => {
    if (isLoading && isMounted.current) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        if (isMounted.current) {
          setLoadingTimeout(true);
          // Force isLoading to false to break out of loading state
          setIsLoading(false);
        }
      }, 3000); // Reduzir para 3 segundos
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, setIsLoading]);
  
  // Handle timeout and redirect to auth if needed
  useEffect(() => {
    if (loadingTimeout && isLoading && isMounted.current) {
      setIsLoading(false);
      toast("Tempo limite excedido, redirecionando para login");
      navigate('/login', { replace: true });
    }
  }, [loadingTimeout, isLoading, navigate, setIsLoading]);

  // Check user role when profile is loaded
  useEffect(() => {
    if (!profile || redirectChecked || !isMounted.current || !user) {
      return;
    }
    
    if (profile.role === 'admin') {
      toast("Redirecionando para área admin");
      navigate('/admin', { replace: true });
    }
    
    setRedirectChecked(true);
  }, [profile, navigate, redirectChecked, user]);

  return {
    user,
    profile,
    isAdmin,
    isLoading,
    loadingTimeout,
    redirectChecked
  };
};
