
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requiredRole?: string;
}

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  requiredRole
}: ProtectedRouteProps) => {
  const { user, profile, isAdmin, hasCompletedOnboarding, isLoading } = useAuth();
  const location = useLocation();
  const [isLegacyUser, setIsLegacyUser] = useState<boolean | null>(null);
  
  // Verificar se é usuário legacy
  useEffect(() => {
    const checkLegacyStatus = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase.rpc('is_legacy_user', {
          user_id: user.id
        });
        
        if (!error) {
          setIsLegacyUser(data);
        }
      } catch (error) {
        console.error('Erro ao verificar status legacy:', error);
        setIsLegacyUser(false);
      }
    };
    
    if (user?.id) {
      checkLegacyStatus();
    }
  }, [user?.id]);
  
  // Se estiver carregando ou verificando status legacy, mostra tela de loading
  if (isLoading || (user && isLegacyUser === null)) {
    return <LoadingScreen message="Verificando sua autenticação..." />;
  }

  // Se não houver usuário autenticado, redireciona para login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // VERIFICAÇÃO DE ONBOARDING (APENAS PARA USUÁRIOS NOVOS)
  // Rotas permitidas sem onboarding completo
  const allowedWithoutOnboarding = ['/login', '/onboarding', '/auth'];
  const isOnboardingRoute = allowedWithoutOnboarding.some(route => 
    location.pathname.startsWith(route)
  );

  // Usuários legacy podem navegar livremente
  if (isLegacyUser) {
    console.log("[PROTECTED-ROUTE] Usuário legacy detectado, permitindo navegação livre");
  } else if (!hasCompletedOnboarding && !isOnboardingRoute) {
    // Apenas usuários NOVOS são obrigados a completar o onboarding
    console.log("[PROTECTED-ROUTE] Usuário novo sem onboarding completado, redirecionando...", {
      hasProfile: !!profile,
      profileId: profile?.id,
      onboardingCompleted: profile?.onboarding_completed,
      currentPath: location.pathname,
      isLegacyUser
    });
    
    // Fallback: Se não há perfil mas há usuário, dar mais tempo
    if (user && !profile) {
      console.log("[PROTECTED-ROUTE] Aguardando criação do perfil...");
      return <LoadingScreen message="Configurando sua conta..." />;
    }
    
    // Redirecionar para onboarding
    return <Navigate to="/onboarding" replace />;
  }
  
  // Verificar se requer admin e usuário não é admin
  if ((requiredRole === 'admin' || requireAdmin) && !isAdmin) {
    toast.error("Você não tem permissão para acessar esta área");
    return <Navigate to="/dashboard" replace />;
  }

  // Usuário está autenticado, tem onboarding completo e permissões necessárias
  return <>{children}</>;
};

export default ProtectedRoute;
