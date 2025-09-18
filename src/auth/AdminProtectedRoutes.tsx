
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, ReactNode } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";

interface AdminProtectedRoutesProps {
  children: ReactNode;
}

export const AdminProtectedRoutes = ({ children }: AdminProtectedRoutesProps) => {
  // Usar useAuth de forma defensiva
  let user, profile, isAdmin, isLoading;
  try {
    const authContext = useAuth();
    user = authContext?.user;
    profile = authContext?.profile;
    isAdmin = authContext?.isAdmin;
    isLoading = authContext?.isLoading;
  } catch (error) {
    console.log('🛡️ [ADMIN-PROTECTED] AuthProvider não disponível ainda, mostrando loading');
    return <LoadingScreen message="Inicializando autenticação..." />;
  }
  
  const location = useLocation();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  
  // Configurar timeout de carregamento
  useEffect(() => {
    if (isLoading && !loadingTimeout) {
      // Limpar qualquer timeout existente
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        setLoadingTimeout(true);
      }, 5000); // 5 segundos para maior tolerância
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, loadingTimeout]);

  // Mostrar tela de carregamento enquanto verifica autenticação (mas apenas se o timeout não foi excedido)
  if (isLoading && !loadingTimeout) {
    return <LoadingScreen message="Verificando permissões de administrador..." />;
  }

  // Se o usuário não estiver autenticado, redireciona para a página de login
  if (!user) {
    toast.error("Por favor, faça login para acessar esta página");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // CRÍTICO: Verificar se usuário completou onboarding antes de verificar permissões
  if (user && profile && profile.onboarding_completed !== true) {
    console.log("📝 [ADMIN-PROTECTED] Usuário precisa completar onboarding primeiro");
    toast.info("Complete seu onboarding primeiro para acessar esta área");
    return <Navigate to="/onboarding" replace />;
  }

  // Se o usuário não for administrador, redireciona para o dashboard
  if (!isAdmin) {
    toast.error("Você não tem permissão para acessar esta área");
    return <Navigate to="/dashboard" replace />;
  }

  // Usuário é administrador, renderiza as rotas protegidas
  return <>{children}</>;
};
