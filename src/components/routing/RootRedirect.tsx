
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
  
  console.log('RootRedirect: Estado atual', { 
    hasUser: !!user, 
    hasProfile: !!profile, 
    isAdmin, 
    isLoading, 
    timeoutExceeded 
  });
  
  // Determinar para onde redirecionar com fallback mais rápido
  useEffect(() => {
    if (isLoading && !timeoutExceeded) {
      console.log('RootRedirect: Ainda carregando...');
      return;
    }
    
    if (!user) {
      console.log('RootRedirect: Sem usuário, redirecionando para login');
      setRedirectTarget('/login');
    } else if (user && profile) {
      if (profile.role === 'admin' || isAdmin) {
        console.log('RootRedirect: Admin detectado, redirecionando para admin');
        setRedirectTarget('/admin');
      } else {
        console.log('RootRedirect: Usuário normal, redirecionando para dashboard');
        setRedirectTarget('/dashboard');
      }
    } else if (user && !profile) {
      console.log('RootRedirect: Usuário sem perfil, redirecionando para dashboard mesmo assim');
      setRedirectTarget('/dashboard');
    }
  }, [user, profile, isAdmin, isLoading, timeoutExceeded]);
  
  // Realizar o redirecionamento
  useEffect(() => {
    if (redirectTarget) {
      console.log('RootRedirect: Executando redirecionamento para', redirectTarget);
      const redirectTimer = setTimeout(() => {
        navigate(redirectTarget, { replace: true });
      }, 100);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [redirectTarget, navigate]);
  
  // Timeout mais agressivo para evitar loading infinito
  useEffect(() => {
    if (isLoading && !timeoutExceeded) {
      const timeout = setTimeout(() => {
        console.warn('RootRedirect: Timeout atingido, forçando redirecionamento');
        setTimeoutExceeded(true);
      }, 2000); // Reduzido para 2 segundos
      
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
  
  // Fallback redirect mais agressivo
  if (timeoutExceeded || !redirectTarget) {
    console.warn('RootRedirect: Usando fallback, redirecionando para dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  return null;
};

export default RootRedirect;
