
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProtectedRoutesProps {
  children: ReactNode;
}

export const ProtectedRoutes = ({ children }: ProtectedRoutesProps) => {
  const location = useLocation();
  const { user, profile, isLoading } = useAuth();
  const [isLegacyUser, setIsLegacyUser] = useState<boolean | null>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const profileCreationAttempted = useRef(false);

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

  // Tentar criar perfil para usuário sem perfil (apenas uma vez)
  useEffect(() => {
    const createMissingProfile = async () => {
      if (!user?.id || profile || isCreatingProfile || profileCreationAttempted.current) {
        return;
      }

      console.log(`[PROTECTED] Tentando criar perfil para usuário: ${user.id}`);
      profileCreationAttempted.current = true;
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
      : "Verificando credenciais...";
    return <LoadingScreen message={message} />;
  }

  // Sem usuário = login imediatamente
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Rotas permitidas sem verificação de perfil
  const allowedWithoutOnboarding = ['/login', '/onboarding', '/auth'];
  const isOnboardingRoute = allowedWithoutOnboarding.some(route => 
    location.pathname.startsWith(route)
  );

  // CORREÇÃO CRÍTICA: Se não há perfil, aguardar criação ou redirecionar para login
  if (!profile && !isOnboardingRoute) {
    // Se já tentamos criar o perfil e ainda não temos, redirecionar para login
    if (profileCreationAttempted.current && !isCreatingProfile) {
      console.warn("[PROTECTED] Perfil não pôde ser criado, redirecionando para login");
      toast.error("Erro na configuração da conta. Faça login novamente.");
      return <Navigate to="/login" replace />;
    }
    
    // Se ainda estamos no processo, mostrar loading
    return <LoadingScreen message="Configurando sua conta..." />;
  }

  // ONBOARDING OPCIONAL - Todos os usuários podem navegar livremente
  console.log("[PROTECTED] Usuário autenticado com perfil válido");

  // Tudo ok - renderizar conteúdo
  return <>{children}</>;
};
