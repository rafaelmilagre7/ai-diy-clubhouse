
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
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  
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

  // Tentar criar perfil automaticamente se ausente
  useEffect(() => {
    const createMissingProfile = async () => {
      if (!user?.id || profile || isCreatingProfile || isLoading) {
        return;
      }

      console.log(`[PROTECTED] Tentando criar perfil para usuário: ${user.id}`);
      setIsCreatingProfile(true);

      try {
        const { data, error } = await supabase.rpc('create_missing_profile_safe', {
          target_user_id: user.id
        });

        if (error) {
          console.error('[PROTECTED] Erro ao criar perfil:', error);
          toast.error('Erro ao configurar perfil do usuário');
        } else {
          console.log('[PROTECTED] Resultado da criação de perfil:', data);
          toast.success('Perfil configurado com sucesso');
          // Aguardar um momento para o perfil ser carregado no contexto
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } catch (error) {
        console.error('[PROTECTED] Erro crítico ao criar perfil:', error);
        toast.error('Erro crítico na configuração do perfil');
      } finally {
        setIsCreatingProfile(false);
      }
    };

    if (user && !profile && !isLoading && isLegacyUser !== null) {
      createMissingProfile();
    }
  }, [user, profile, isLoading, isLegacyUser, isCreatingProfile]);
  
  // Se estiver carregando ou verificando status legacy, mostra tela de loading
  if (isLoading || (user && isLegacyUser === null) || isCreatingProfile) {
    const message = isCreatingProfile 
      ? "Configurando seu perfil..." 
      : "Verificando sua autenticação...";
    return <LoadingScreen message={message} />;
  }

  // Se não houver usuário autenticado, redireciona para login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se não há perfil após tentativa de criação, redirecionar para login
  if (!profile) {
    console.warn("[PROTECTED] Usuário sem perfil, redirecionando para login");
    toast.error("Erro na configuração da conta. Faça login novamente.");
    return <Navigate to="/login" replace />;
  }

  // VERIFICAÇÃO DE ONBOARDING (APENAS PARA USUÁRIOS NOVOS)
  // Rotas permitidas sem onboarding completo
  const allowedWithoutOnboarding = ['/login', '/onboarding', '/auth'];
  const isOnboardingRoute = allowedWithoutOnboarding.some(route => 
    location.pathname.startsWith(route)
  );

  // Usuários legacy podem navegar livremente
  if (isLegacyUser) {
    // Permitir navegação livre para usuários legacy
  } else if (!hasCompletedOnboarding && !isOnboardingRoute) {
    // Apenas usuários NOVOS são obrigados a completar o onboarding
    return <Navigate to="/onboarding" replace />;
  }
  
  // Verificar se requer admin e usuário não é admin
  if ((requiredRole === 'admin' || requireAdmin) && !isAdmin) {
    toast.error("Você não tem permissão para acessar esta área");
    return <Navigate to="/dashboard" replace />;
  }

  // Verificar role específico
  if (requiredRole && requiredRole !== 'admin') {
    const userRoleName = profile?.user_roles?.name || profile?.role_id;
    if (userRoleName !== requiredRole && !isAdmin) {
      toast.error("Você não tem permissão para acessar esta área");
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Usuário está autenticado, tem perfil válido e permissões necessárias
  return <>{children}</>;
};

export default ProtectedRoute;
