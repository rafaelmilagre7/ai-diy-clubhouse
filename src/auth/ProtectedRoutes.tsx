
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRoutesProps {
  children: ReactNode;
}

export const ProtectedRoutes = ({ children }: ProtectedRoutesProps) => {
  const location = useLocation();
  const { user, profile, isLoading } = useAuth();
  const [isLegacyUser, setIsLegacyUser] = useState<boolean | null>(null);
  const [profileCreationAttempted, setProfileCreationAttempted] = useState(false);

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

  // Tentar criar perfil se usuário não tiver um
  useEffect(() => {
    const createMissingProfile = async () => {
      if (!user?.id || profile || profileCreationAttempted || isLoading) return;
      
      setProfileCreationAttempted(true);
      
      try {
        console.log(`[PROTECTED] Tentando criar perfil para usuário: ${user.id}`);
        
        // Buscar role padrão
        const { data: defaultRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('name', 'membro_club')
          .single();

        // Criar perfil básico
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            name: user.email?.split('@')[0] || 'Usuário',
            role_id: defaultRole?.id,
            onboarding_completed: false
          });

        if (profileError) {
          console.error('[PROTECTED] Erro ao criar perfil:', profileError);
        } else {
          console.log('[PROTECTED] Perfil criado com sucesso');
          // Forçar reload da página para recarregar o contexto de auth
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } catch (error) {
        console.error('[PROTECTED] Erro crítico ao criar perfil:', error);
      }
    };

    createMissingProfile();
  }, [user?.id, profile, profileCreationAttempted, isLoading]);

  // Se estiver carregando ou verificando status legacy, mostra tela de loading
  if (isLoading || (user && isLegacyUser === null)) {
    return <LoadingScreen message="Verificando credenciais..." />;
  }

  // Sem usuário = login imediatamente
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Rotas permitidas sem verificação
  const allowedWithoutOnboarding = ['/login', '/onboarding', '/auth'];
  const isOnboardingRoute = allowedWithoutOnboarding.some(route => 
    location.pathname.startsWith(route)
  );

  // CORREÇÃO: Em vez de lançar erro, redirecionar para login ou criar perfil
  if (!profile && !isOnboardingRoute) {
    // Se ainda não tentamos criar o perfil, mostrar loading
    if (!profileCreationAttempted) {
      return <LoadingScreen message="Configurando sua conta..." />;
    }
    
    // Se já tentamos criar o perfil mas falhou, redirecionar para login
    console.warn("[PROTECTED] Usuário sem perfil válido - redirecionando para login");
    return <Navigate to="/login" state={{ 
      from: location.pathname,
      error: "Erro na configuração da conta. Tente fazer login novamente." 
    }} replace />;
  }

  // Tudo ok - renderizar conteúdo
  return <>{children}</>;
};
