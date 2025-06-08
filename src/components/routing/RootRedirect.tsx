
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { PageTransitionWithFallback } from "@/components/transitions/PageTransitionWithFallback";
import { toast } from "sonner";

const RootRedirect = () => {
  const { user, profile, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [timeoutExceeded, setTimeoutExceeded] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null);
  
  // Determinar para onde redirecionar com base no estado da autenticação
  useEffect(() => {
    // Não fazer nada enquanto carrega
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
    if (isLoading && !timeoutExceeded) {
      const timeout = setTimeout(() => {
        setTimeoutExceeded(true);
        toast("Tempo de carregamento excedido, redirecionando para tela de login");
      }, 3000); // 3 segundos de timeout
      
      return () => clearTimeout(timeout);
    }
  }, [isLoading, timeoutExceeded]);
  
  // Mostrar tela de carregamento enquanto decide para onde redirecionar
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
  
  // Fallback redirect se algo deu errado
  if (timeoutExceeded || !redirectTarget) {
    return <Navigate to="/login" replace />;
  }
  
  // Retornar null porque o useEffect cuida do redirecionamento
  return null;
};

export default RootRedirect;
