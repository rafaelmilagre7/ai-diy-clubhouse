
import { Navigate, useLocation } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { SecurityProvider } from "@/contexts/auth/SecurityContext";
import { getOnboardingProgress, getNextOnboardingStep, fixCurrentUserOnboarding } from "@/utils/onboardingFix";

interface ProtectedRoutesProps {
  children: ReactNode;
}

export const ProtectedRoutes = ({ children }: ProtectedRoutesProps) => {
  const location = useLocation();
  const [onboardingProgress, setOnboardingProgress] = useState<any>(null);
  const [isCheckingProgress, setIsCheckingProgress] = useState(false);
  const [hasTriedFix, setHasTriedFix] = useState(false);
  
  // CORREÇÃO: Verificação segura do contexto
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error("[PROTECTED] Auth context não disponível:", error);
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const { user, profile, isLoading } = authContext;

  // Verificar progresso real do onboarding quando usuário estiver disponível
  useEffect(() => {
    if (user && profile && !isCheckingProgress) {
      checkOnboardingProgress();
    }
  }, [user?.id, profile?.onboarding_completed]);

  const checkOnboardingProgress = async () => {
    if (!user) return;
    
    setIsCheckingProgress(true);
    try {
      const progress = await getOnboardingProgress(user.id);
      setOnboardingProgress(progress);
      
      // Se há inconsistência entre profile e onboarding, tentar corrigir
      if (progress && !profile?.onboarding_completed && progress.completed_steps.length >= 6 && !hasTriedFix) {
        console.log("[PROTECTED] Detectada inconsistência, tentando corrigir...");
        setHasTriedFix(true);
        await fixCurrentUserOnboarding();
        // Forçar reload da página para recarregar o profile
        window.location.reload();
      }
    } catch (error) {
      console.error("[PROTECTED] Erro ao verificar progresso:", error);
    } finally {
      setIsCheckingProgress(false);
    }
  };

  // Loading states
  if (isLoading || isCheckingProgress) {
    return <LoadingScreen message="Verificando credenciais..." />;
  }

  // Se não há usuário autenticado, redirecionar para login
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Rotas permitidas sem onboarding completo
  const allowedWithoutOnboarding = ['/login', '/onboarding', '/auth'];
  const isOnboardingRoute = allowedWithoutOnboarding.some(route => 
    location.pathname.startsWith(route)
  );

  // Se ainda não tem perfil carregado, aguardar (exceto rotas de onboarding)
  if (!profile && !isOnboardingRoute) {
    return <LoadingScreen message="Carregando perfil do usuário..." />;
  }

  // LÓGICA INTELIGENTE DE ONBOARDING
  if (profile && !profile.onboarding_completed && !isOnboardingRoute) {
    // Verificar progresso real se disponível
    if (onboardingProgress) {
      const nextStep = getNextOnboardingStep(onboardingProgress);
      
      if (onboardingProgress.is_completed) {
        // Se onboarding está completo mas profile não sincronizado, aguardar correção
        return <LoadingScreen message="Sincronizando seu progresso..." />;
      }
      
      console.log(`[PROTECTED] Redirecionando para step ${nextStep} baseado no progresso real`);
      return <Navigate to={`/onboarding/step/${nextStep}`} replace />;
    } else {
      // Fallback para step 1 se não conseguir verificar progresso
      console.log("[PROTECTED] Redirecionando para onboarding - step 1 (fallback)");
      return <Navigate to="/onboarding/step/1" replace />;
    }
  }

  // Usuário autenticado e com onboarding completo - renderizar conteúdo protegido
  return (
    <SecurityProvider>
      {children}
    </SecurityProvider>
  );
};
