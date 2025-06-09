
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export const useLayoutAuthentication = () => {
  const { user, profile, isAdmin, isLoading, setIsLoading } = useAuth();
  const navigate = useNavigate();
  const [redirectChecked, setRedirectChecked] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const isMounted = useRef(true);
  const maxRetries = 3;
  const authTimeout = 10000; // 10 segundos ao invés de 3

  // Setup component lifecycle
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Setup loading timeout effect com retry logic mais inteligente
  useEffect(() => {
    if (isLoading && isMounted.current) {
      const timeoutId = setTimeout(() => {
        if (isMounted.current && isLoading) {
          if (retryCount < maxRetries) {
            console.warn(`[AUTH] Loading timeout - retry ${retryCount + 1}/${maxRetries}`);
            setRetryCount(prev => prev + 1);
            toast.warning(`Verificando autenticação... (${retryCount + 1}/${maxRetries})`);
          } else {
            console.error("[AUTH] Auth timeout after retries");
            setIsLoading(false);
            toast.error("Timeout na autenticação. Redirecionando...");
            navigate('/login', { replace: true });
          }
        }
      }, authTimeout);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, retryCount, setIsLoading, navigate]);

  // Check user role when profile is loaded (apenas uma vez)
  useEffect(() => {
    if (!profile || redirectChecked || !isMounted.current || !user || isLoading) {
      return;
    }
    
    // Reset retry count quando conseguimos carregar o perfil
    setRetryCount(0);
    
    if (profile.role === 'admin') {
      console.info("[AUTH] Admin user detected, redirecting to admin area");
      toast.success("Redirecionando para área administrativa");
      navigate('/admin', { replace: true });
    }
    
    setRedirectChecked(true);
  }, [profile, navigate, redirectChecked, user, isLoading]);

  return {
    user,
    profile,
    isAdmin,
    isLoading: isLoading && retryCount < maxRetries,
    retryCount,
    redirectChecked
  };
};
