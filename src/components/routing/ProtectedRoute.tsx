
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

  // Simplificado: Apenas aguardar perfil ser carregado pelo AuthContext
  useEffect(() => {
    // Se usuário existe mas não tem perfil após tempo suficiente, pode ser problema
    if (user && !profile && !isLoading && isLegacyUser !== null) {
      const timer = setTimeout(() => {
        if (!profile) {
          console.warn('[PROTECTED] Perfil não carregado após timeout, redirecionando para login');
          toast.error('Erro na configuração da conta. Faça login novamente.');
        }
      }, 3000); // 3 segundos de timeout

      return () => clearTimeout(timer);
    }
  }, [user, profile, isLoading, isLegacyUser]);
  
  // Se estiver carregando ou verificando status legacy, mostra tela de loading
  if (isLoading || (user && isLegacyUser === null)) {
    return <LoadingScreen message="Verificando sua autenticação..." />;
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

  // VERIFICAÇÃO DE ONBOARDING - Simplificada
  const isOnboardingRoute = location.pathname.startsWith('/onboarding');
  
  // Apenas usuários novos que não completaram onboarding precisam ir para onboarding
  if (!isLegacyUser && !hasCompletedOnboarding && !isOnboardingRoute) {
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
