
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { PageTransitionWithFallback } from "@/components/transitions/PageTransitionWithFallback";

const RootRedirect = () => {
  const { user, profile, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [timeoutExceeded, setTimeoutExceeded] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null);
  
  // Determinar para onde redirecionar
  useEffect(() => {
    if (isLoading && !timeoutExceeded) return;
    
    if (!user) {
      setRedirectTarget('/login');
    } else if (user && profile) {
      if (profile.role === 'admin' || isAdmin) {
        setRedirectTarget('/admin');
      } else {
        setRedirectTarget('/dashboard');
      }
    }
  }, [user, profile, isAdmin, isLoading, timeoutExceeded]);
  
  // Realizar o redirecionamento
  useEffect(() => {
    if (redirectTarget) {
      const redirectTimer = setTimeout(() => {
        navigate(redirectTarget, { replace: true });
      }, 100);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [redirectTarget, navigate]);
  
  // Timeout para evitar loading infinito
  useEffect(() => {
    if (isLoading && !timeoutExceeded) {
      const timeout = setTimeout(() => {
        setTimeoutExceeded(true);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [isLoading, timeoutExceeded]);
  
  // Mostrar loading ou fallback
  if ((isLoading && !timeoutExceeded) || (!redirectTarget && !timeoutExceeded)) {
    return (
      <PageTransitionWithFallback
        isVisible={true}
        fallbackMessage="Redirecionando..."
      >
        <LoadingScreen message="Preparando sua experiência..." />
      </PageTransitionWithFallback>
    );
  }
  
  // Fallback redirect
  if (timeoutExceeded || !redirectTarget) {
    return <Navigate to="/login" replace />;
  }
  
  return null;
};

export default RootRedirect;
