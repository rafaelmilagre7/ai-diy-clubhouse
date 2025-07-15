
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

  // Verificar progresso do onboarding usando nova função centralizada (com throttle)
  useEffect(() => {
    if (user && profile && !isCheckingProgress && !hasTriedFix) {
      const timer = setTimeout(() => {
        checkOnboardingProgress();
      }, 100); // Pequeno delay para evitar chamadas simultâneas
      
      return () => clearTimeout(timer);
    }
  }, [user?.id, profile?.onboarding_completed, isCheckingProgress, hasTriedFix]);

  const checkOnboardingProgress = async () => {
    if (!user || isCheckingProgress || hasTriedFix) return;
    
    setIsCheckingProgress(true);
    console.log("[PROTECTED] Verificando progresso do onboarding para:", user.id);
    
    try {
      // Timeout para evitar travamentos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      const dataPromise = supabase.rpc('get_onboarding_next_step', {
        p_user_id: user.id
      });

      const { data, error } = await Promise.race([dataPromise, timeoutPromise]) as any;

      if (error) {
        console.error("[PROTECTED] Erro ao verificar onboarding:", error);
        setHasTriedFix(true);
        return;
      }

      console.log("[PROTECTED] Estado do onboarding:", data);
      
      // Converter para formato esperado
      const progress = data?.is_completed ? {
        current_step: 7,
        completed_steps: [1, 2, 3, 4, 5, 6],
        is_completed: true
      } : {
        current_step: data?.current_step || 1,
        completed_steps: data?.completed_steps || [],
        is_completed: false
      };
      
      setOnboardingProgress(progress);
      setHasTriedFix(true);
    } catch (error) {
      console.error("[PROTECTED] Erro inesperado:", error);
      setHasTriedFix(true);
      // Em caso de erro, usar dados do perfil como fallback
      if (profile?.onboarding_completed) {
        setOnboardingProgress({
          current_step: 7,
          completed_steps: [1, 2, 3, 4, 5, 6],
          is_completed: true
        });
      }
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
      if (onboardingProgress.is_completed) {
        // Se onboarding está completo mas profile não sincronizado, aguardar correção
        return <LoadingScreen message="Sincronizando seu progresso..." />;
      }
      
      const nextStep = Math.max(1, onboardingProgress.current_step || 1);
      console.log(`[PROTECTED] Redirecionando para step ${nextStep} baseado no progresso real`);
      return <Navigate to={`/onboarding/step/${nextStep}`} replace />;
    } else {
      // Fallback para step 1 se não conseguir verificar progresso
      console.log("[PROTECTED] Redirecionando para onboarding - step 1 (fallback)");
      return <Navigate to="/onboarding/step/1" replace />;
    }
  }

  // Usuário autenticado e com onboarding completo - renderizar conteúdo protegido
  return children;
};
