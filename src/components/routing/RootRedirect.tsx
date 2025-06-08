
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useOnboardingStatus } from "@/components/onboarding/hooks/useOnboardingStatus";
import LoadingScreen from "@/components/common/LoadingScreen";
import { PageTransitionWithFallback } from "@/components/transitions/PageTransitionWithFallback";
import { toast } from "sonner";

const RootRedirect = () => {
  const { user, profile, isAdmin, isLoading: authLoading } = useAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading, canProceed } = useOnboardingStatus();
  const navigate = useNavigate();
  const [timeoutExceeded, setTimeoutExceeded] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null);
  
  // Determinar para onde redirecionar
  useEffect(() => {
    // Aguardar até que as verificações estejam completas
    if (!canProceed || authLoading || onboardingLoading) {
      return;
    }
    
    if (!user) {
      setRedirectTarget('/login');
    } else if (user && profile) {
      if (onboardingRequired) {
        setRedirectTarget('/onboarding');
      } else if (profile.role === 'admin' || isAdmin) {
        setRedirectTarget('/admin');
      } else {
        setRedirectTarget('/dashboard');
      }
    } else if (user && !profile) {
      // Fallback se não tiver perfil
      setRedirectTarget('/dashboard');
    }
  }, [user, profile, isAdmin, authLoading, onboardingLoading, onboardingRequired, canProceed]);
  
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
    if ((authLoading || onboardingLoading) && !timeoutExceeded) {
      const timeout = setTimeout(() => {
        setTimeoutExceeded(true);
        toast("Tempo de carregamento excedido, redirecionando para dashboard");
        setRedirectTarget('/dashboard');
      }, 8000);
      
      return () => clearTimeout(timeout);
    }
  }, [authLoading, onboardingLoading, timeoutExceeded]);
  
  // Mostrar loading
  if (((authLoading || onboardingLoading) && !timeoutExceeded) || (!redirectTarget && !timeoutExceeded)) {
    const message = onboardingLoading ? "Verificando seu progresso..." : "Preparando sua experiência...";
    
    return (
      <PageTransitionWithFallback
        isVisible={true}
        fallbackMessage="Redirecionando..."
      >
        <LoadingScreen message={message} />
      </PageTransitionWithFallback>
    );
  }
  
  // Fallback redirect
  if (timeoutExceeded || !redirectTarget) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return null;
};

export default RootRedirect;
