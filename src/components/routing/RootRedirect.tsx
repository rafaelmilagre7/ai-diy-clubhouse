
import { useState, useEffect, useRef, ReactNode } from "react";
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
  const timeoutRef = useRef<number | null>(null);
  
  // Registrar estado para depuração
  console.log("RootRedirect state:", { 
    user: !!user, 
    profile: !!profile, 
    isAdmin, 
    isLoading, 
    timeoutExceeded,
    redirectTarget,
    userEmail: user?.email
  });
  
  // Configurar timeout de carregamento
  useEffect(() => {
    if (isLoading && !timeoutExceeded) {
      // Limpar qualquer timeout existente
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        console.log("RootRedirect: Loading timeout exceeded, redirecting to /login");
        setTimeoutExceeded(true);
        toast("Tempo de carregamento excedido, redirecionando para tela de login");
      }, 3000); // 3 segundos de timeout
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, timeoutExceeded]);
  
  // Determinar para onde redirecionar com base no estado da autenticação
  useEffect(() => {
    // Não fazer nada enquanto carrega
    if (isLoading && !timeoutExceeded) return;
    
    if (!user) {
      console.log("RootRedirect: No user, redirecting to /login");
      setRedirectTarget('/login');
    } else if (user && profile) {
      console.log("RootRedirect: User and profile available, redirecting based on role");
      if (profile.role === 'admin' || isAdmin) {
        setRedirectTarget('/admin');
      } else {
        setRedirectTarget('/dashboard');
      }
    } else if (user && !profile) {
      console.log("RootRedirect: User without profile, redirecting to dashboard");
      setRedirectTarget('/dashboard');
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
