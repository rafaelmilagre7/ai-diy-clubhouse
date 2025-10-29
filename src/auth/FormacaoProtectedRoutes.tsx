
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, ReactNode } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { showModernError, showModernInfo } from '@/lib/toast-helpers';

interface FormacaoProtectedRoutesProps {
  children: ReactNode;
}

export const FormacaoProtectedRoutes = ({ children }: FormacaoProtectedRoutesProps) => {
  const { user, profile, isAdmin, isFormacao, isLoading } = useAuth();
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
    return <LoadingScreen message="Verificando permissões de acesso..." />;
  }

  // Se o usuário não estiver autenticado, redireciona para a página de login
  if (!user) {
    showModernError('Acesso negado', 'Faça login para acessar esta página');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // CRÍTICO: Verificar se usuário completou onboarding antes de verificar permissões
  if (user && profile && profile.onboarding_completed !== true) {
    showModernInfo('Onboarding pendente', 'Complete seu cadastro para acessar');
    return <Navigate to="/onboarding" replace />;
  }

  // CORREÇÃO: Verificar se usuário tem acesso à formação (admin ou formacao)
  if (!isAdmin && !isFormacao) {
    showModernError('Permissão negada', 'Você não tem acesso a esta área');
    return <Navigate to="/dashboard" replace />;
  }

  // Usuário é admin, renderiza as rotas protegidas
  return <>{children}</>;
};
