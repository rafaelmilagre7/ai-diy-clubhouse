
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
        console.log(`[PROTECTED] Usando função segura para criar perfil: ${user.id}`);
        
        // Usar a função segura do banco de dados
        const { data, error } = await supabase.rpc('create_missing_profile_safe', {
          target_user_id: user.id
        });

        if (error) {
          console.error('[PROTECTED] Erro ao criar perfil:', error);
        } else {
          console.log('[PROTECTED] Resultado da criação:', data);
          if (data?.success) {
            // Forçar reload da página para recarregar o contexto de auth
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
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

  // CORREÇÃO DEFINITIVA: NUNCA redirecionar para /login para evitar loops
  if (!profile && !isOnboardingRoute) {
    // Se ainda não tentamos criar o perfil, mostrar loading
    if (!profileCreationAttempted) {
      return <LoadingScreen message="Configurando sua conta..." />;
    }
    
    // Se já tentamos criar o perfil mas falhou, mostrar erro em vez de redirecionar
    console.warn("[PROTECTED] Usuário sem perfil válido - mostrando erro");
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Erro na Configuração da Conta
          </h2>
          <p className="text-muted-foreground mb-4">
            Houve um problema ao configurar sua conta. 
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Tudo ok - renderizar conteúdo
  return <>{children}</>;
};
