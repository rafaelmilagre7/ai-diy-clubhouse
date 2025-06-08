
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useOnboardingGuard } from "@/components/onboarding/hooks/useOnboardingGuard";
import LoadingScreen from "@/components/common/LoadingScreen";
import { PageTransitionWithFallback } from "@/components/transitions/PageTransitionWithFallback";
import { toast } from "sonner";

const RootRedirect = () => {
  const { user, profile, isAdmin, isLoading } = useAuth();
  const { isOnboardingRequired, isChecking } = useOnboardingGuard();
  const navigate = useNavigate();
  const [timeoutExceeded, setTimeoutExceeded] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null);
  
  // Determinar para onde redirecionar com base no estado da autenticação e onboarding
  useEffect(() => {
    // Não fazer nada enquanto carrega auth ou onboarding
    if ((isLoading || isChecking) && !timeoutExceeded) return;
    
    if (!user) {
      setRedirectTarget('/login');
    } else if (user && profile) {
      // Verificar se precisa completar onboarding primeiro
      if (isOnboardingRequired) {
        setRedirectTarget('/onboarding');
      } else if (profile.role === 'admin' || isAdmin) {
        setRedirectTarget('/admin');
      } else {
        setRedirectTarget('/dashboard');
      }
    }
  }, [user, profile, isAdmin, isLoading, isChecking, isOnboardingRequired, timeoutExceeded]);
  
  // Realizar o redirecionamento quando o alvo for definido
  useEffect(() => {
    if (redirectTarget) {
      // Pequeno delay para garantir que a UI reaja antes do redirecionamento
      const redirectTimer = setTimeout(() => {
        navigate(redirectTarget, { replace: true });
      }, 100);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [redirectTarget, navigate]);
  
  // Handle timing out the loading state
  useEffect(() => {
    if ((isLoading || isChecking) && !timeoutExceeded) {
      const timeout = setTimeout(() => {
        setTimeoutExceeded(true);
        toast("Tempo de carregamento excedido, redirecionando para tela de login");
      }, 5000); // 5 segundos de timeout para dar tempo do onboarding carregar
      
      return () => clearTimeout(timeout);
    }
  }, [isLoading, isChecking, timeoutExceeded]);
  
  // Mostrar tela de carregamento enquanto decide para onde redirecionar
  if (((isLoading || isChecking) && !timeoutExceeded) || (!redirectTarget && !timeoutExceeded)) {
    const message = isChecking ? "Verificando seu progresso..." : "Preparando sua experiência...";
    
    return (
      <PageTransitionWithFallback
        isVisible={true}
        fallbackMessage="Redirecionando..."
      >
        <LoadingScreen message={message} />
      </PageTransitionWithFallback>
    );
  }
  
  // Fallback redirect se algo deu errado
  if (timeoutExceeded || !redirectTarget) {
    return <Navigate to="/login" replace />;
  }
  
  // Retornar null porque o useEffect cuida do redirecionamento
  return null;
};

export default RootRedirect;
