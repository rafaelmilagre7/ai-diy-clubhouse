
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
// Removido SecurityProvider - já está no App.tsx
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRoutesProps {
  children: ReactNode;
}

export const ProtectedRoutes = ({ children }: ProtectedRoutesProps) => {
  const location = useLocation();
  const { user, profile, isLoading } = useAuth();
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

  // Sem perfil = erro crítico (exceto em rotas de onboarding)
  if (!profile && !isOnboardingRoute) {
    console.error("[PROTECTED] ERRO CRÍTICO: Usuário sem perfil");
    throw new Error(`Usuário ${user.id} não possui perfil válido. Dados corrompidos.`);
  }

  // ONBOARDING REMOVIDO - Todos os usuários podem navegar livremente

  // Tudo ok - renderizar conteúdo
  return children;
};
