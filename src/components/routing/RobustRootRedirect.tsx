
import { Navigate } from "react-router-dom";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import { useOnboardingRequired } from "@/hooks/useOnboardingRequired";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useLoadingTimeoutEnhanced } from "@/hooks/useLoadingTimeoutEnhanced";
import { useProductionLogger } from "@/hooks/useProductionLogger";
import { useEffect } from "react";

const RobustRootRedirect = () => {
  const { user, profile, isLoading: authLoading, isAdmin } = useSimpleAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingRequired();
  
  const totalLoading = authLoading || onboardingLoading;
  const { log } = useProductionLogger({ component: 'RobustRootRedirect' });
  
  const { hasTimedOut, retry } = useLoadingTimeoutEnhanced({
    isLoading: totalLoading,
    timeoutMs: 5000,
    context: 'root_redirect',
    onTimeout: () => {
      log('Timeout no carregamento inicial');
    }
  });

  useEffect(() => {
    log("Estado atual:", {
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
  }, [user, profile, authLoading, onboardingLoading, onboardingRequired, totalLoading, hasTimedOut, isAdmin, log]);

  if (hasTimedOut) {
    log('TIMEOUT CRÍTICO - Forçando recuperação');
    
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
  
  if (totalLoading) {
    return <LoadingScreen message="Verificando seu acesso..." />;
  }
  
  if (!user) {
    log("Sem usuário -> login");
    return <Navigate to="/login" replace />;
  }
  
  if (isAdmin) {
    log("ADMIN DETECTADO - Redirecionamento direto para /admin", {
      userId: user.id.substring(0, 8) + '***',
      userRole: profile?.user_roles?.name,
      onboardingRequired: onboardingRequired,
      bypassReason: 'ADMIN_PRIORITY_ABSOLUTE'
    });
    return <Navigate to="/admin" replace />;
  }
  
  if (user && !profile) {
    log("Aguardando perfil...");
    return <LoadingScreen message="Carregando perfil..." />;
  }
  
  // Determinar redirecionamento baseado no estado atual
  let redirectPath = '/dashboard';
  
  if (onboardingRequired) {
    redirectPath = '/onboarding';
  } else if (profile?.user_roles?.name === 'formacao') {
    redirectPath = '/formacao';
  }
  
  log("Redirecionamento calculado:", {
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
