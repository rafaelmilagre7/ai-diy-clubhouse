
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useOnboardingStatus } from "@/components/onboarding/hooks/useOnboardingStatus";
import LoadingScreen from "@/components/common/LoadingScreen";
import { PageTransitionWithFallback } from "@/components/transitions/PageTransitionWithFallback";
import { toast } from "sonner";

const RootRedirect = () => {
  const { user, profile, isAdmin, isLoading: authLoading } = useAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingStatus();
  const navigate = useNavigate();
  const [timeoutExceeded, setTimeoutExceeded] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null);
  const [hasRedirected, setHasRedirected] = useState(false);
  
  // Determinar se pode prosseguir (autenticação e onboarding carregados)
  const canProceed = !authLoading && !onboardingLoading;
  
  console.log('[RootRedirect] Estado atual:', {
    authLoading,
    onboardingLoading,
    canProceed,
    user: !!user,
    profile: !!profile,
    onboardingRequired,
    hasRedirected,
    redirectTarget
  });
  
  // Determinar para onde redirecionar (apenas uma vez)
  useEffect(() => {
    if (hasRedirected || !canProceed || authLoading || redirectTarget) {
      return;
    }
    
    console.log('[RootRedirect] Determinando redirecionamento:', {
      user: !!user,
      profile: !!profile,
      onboardingRequired,
      isAdmin
    });
    
    if (!user) {
      console.log('[RootRedirect] Usuário não autenticado, redirecionando para login');
      setRedirectTarget('/login');
    } else if (user && profile) {
      if (onboardingRequired) {
        console.log('[RootRedirect] Onboarding necessário, redirecionando');
        setRedirectTarget('/onboarding');
      } else if (profile.role === 'admin' || isAdmin) {
        console.log('[RootRedirect] Usuário admin, redirecionando para admin');
        setRedirectTarget('/admin');
      } else {
        console.log('[RootRedirect] Usuário comum, redirecionando para dashboard');
        setRedirectTarget('/dashboard');
      }
    } else if (user && !profile) {
      console.log('[RootRedirect] Usuário sem perfil, redirecionando para dashboard');
      setRedirectTarget('/dashboard');
    }
  }, [user, profile, isAdmin, authLoading, onboardingRequired, canProceed, hasRedirected, redirectTarget]);
  
  // Realizar o redirecionamento (apenas uma vez)
  useEffect(() => {
    if (redirectTarget && !hasRedirected) {
      console.log('[RootRedirect] Redirecionando para:', redirectTarget);
      setHasRedirected(true);
      
      const redirectTimer = setTimeout(() => {
        navigate(redirectTarget, { replace: true });
      }, 100);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [redirectTarget, navigate, hasRedirected]);
  
  // Timeout para evitar loading infinito
  useEffect(() => {
    if ((authLoading || onboardingLoading) && !timeoutExceeded && !hasRedirected) {
      const timeout = setTimeout(() => {
        console.log('[RootRedirect] Timeout excedido, forçando redirecionamento para dashboard');
        setTimeoutExceeded(true);
        toast.warning("Tempo de carregamento excedido, redirecionando para dashboard");
        setRedirectTarget('/dashboard');
      }, 8000);
      
      return () => clearTimeout(timeout);
    }
  }, [authLoading, onboardingLoading, timeoutExceeded, hasRedirected]);
  
  // Mostrar loading
  if (((authLoading || onboardingLoading) && !timeoutExceeded) || (!redirectTarget && !timeoutExceeded && !hasRedirected)) {
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
  
  // Fallback redirect se algo der errado
  if (timeoutExceeded || (!redirectTarget && hasRedirected)) {
    console.log('[RootRedirect] Fallback redirect para dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  // Se chegou até aqui sem redirecionar, usar Navigate como fallback
  if (redirectTarget) {
    console.log('[RootRedirect] Navigate fallback para:', redirectTarget);
    return <Navigate to={redirectTarget} replace />;
  }
  
  return null;
};

export default RootRedirect;
