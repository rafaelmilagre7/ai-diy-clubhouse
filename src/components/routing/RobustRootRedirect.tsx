
import { Navigate } from "react-router-dom";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import { useOnboardingRequired } from "@/hooks/useOnboardingRequired";  
import LoadingScreen from "@/components/common/LoadingScreen";
import AuthManager from "@/services/AuthManager";
import { useLoadingTimeoutEnhanced } from "@/hooks/useLoadingTimeoutEnhanced";
import { logger } from "@/utils/logger";
import { useEffect } from "react";

const RobustRootRedirect = () => {
  const { user, profile, isLoading: authLoading, isAdmin } = useSimpleAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingRequired();
  
  const totalLoading = authLoading || onboardingLoading;
  
  // Enhanced loading com timeout robusto
  const { hasTimedOut, retry } = useLoadingTimeoutEnhanced({
    isLoading: totalLoading,
    timeoutMs: 5000, // 5 segundos
    context: 'root_redirect',
    onTimeout: () => {
      logger.warn('[ROBUST-ROOT-REDIRECT] ⏰ Timeout no carregamento inicial', {
        component: 'RobustRootRedirect',
        action: 'loading_timeout',
        authLoading,
        onboardingLoading,
        totalLoading
      });
    }
  });

  useEffect(() => {
    const authManager = AuthManager.getInstance();
    
    const unsubscribe = authManager.on('stateChanged', (authState) => {
      logger.info('[ROBUST-ROOT-REDIRECT] 📡 Estado AuthManager atualizado', {
        component: 'RobustRootRedirect',
        action: 'auth_state_updated',
        hasUser: !!authState.user,
        isLoading: authState.isLoading,
        isAdmin: authState.isAdmin,
        onboardingRequired: authState.onboardingRequired,
        userRole: authState.profile?.user_roles?.name
      });
    });

    return unsubscribe;
  }, []);

  logger.info("[ROBUST-ROOT-REDIRECT] 📊 Estado atual:", {
    hasUser: !!user,
    hasProfile: !!profile,
    authLoading,
    onboardingLoading,
    onboardingRequired,
    totalLoading,
    hasTimedOut,
    isAdmin,
    userRole: profile?.user_roles?.name
  });
  
  // Tratamento de timeout
  if (hasTimedOut) {
    logger.error('[ROBUST-ROOT-REDIRECT] 🚨 TIMEOUT CRÍTICO - Forçando recuperação', {
      component: 'RobustRootRedirect',
      action: 'critical_timeout'
    });
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-[#151823] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-400 text-xl font-semibold">
            ⚠️ Tempo limite atingido
          </div>
          <div className="text-neutral-300">
            A aplicação está demorando para carregar
          </div>
          <div className="space-y-2">
            <button 
              onClick={retry}
              className="bg-viverblue hover:bg-viverblue/80 text-white px-6 py-3 rounded-lg font-medium"
            >
              🔄 Tentar Novamente
            </button>
            <div className="text-sm text-neutral-400">
              ou{" "}
              <button 
                onClick={() => window.location.href = '/login'}
                className="text-viverblue hover:underline"
              >
                ir para login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Loading normal - aguardar sem complexidade
  if (totalLoading) {
    return <LoadingScreen message="Verificando seu acesso..." />;
  }
  
  if (!user) {
    logger.info("[ROBUST-ROOT-REDIRECT] Sem usuário -> login");
    return <Navigate to="/login" replace />;
  }
  
  // Aguardar perfil se necessário
  if (user && !profile) {
    logger.info("[ROBUST-ROOT-REDIRECT] Aguardando perfil...");
    return <LoadingScreen message="Carregando perfil..." />;
  }
  
  // CORREÇÃO CRÍTICA: Admin bypass total do onboarding
  if (isAdmin) {
    logger.info("[ROBUST-ROOT-REDIRECT] 👑 ADMIN detectado - Redirecionando para /admin", {
      userId: user.id.substring(0, 8) + '***',
      userRole: profile?.user_roles?.name
    });
    return <Navigate to="/admin" replace />;
  }
  
  // Usar AuthManager.getRedirectPath() para outros casos
  const authManager = AuthManager.getInstance();
  const redirectPath = authManager.getRedirectPath();
  
  logger.info("[ROBUST-ROOT-REDIRECT] Redirecionamento calculado", {
    redirectPath,
    hasUser: !!user,
    hasProfile: !!profile,
    onboardingRequired,
    isAdmin,
    roleName: profile?.user_roles?.name
  });
  
  return <Navigate to={redirectPath} replace />;
};

export default RobustRootRedirect;
