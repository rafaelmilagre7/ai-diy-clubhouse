
import { Navigate } from "react-router-dom";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import { useOnboardingRequired } from "@/hooks/useOnboardingRequired";
import LoadingScreen from "@/components/common/LoadingScreen";
import AuthManager from "@/services/AuthManager";
import { useLoadingTimeoutEnhanced } from "@/hooks/useLoadingTimeoutEnhanced";
import { logger } from "@/utils/logger";
import { useEffect, useState } from "react";

const RobustRootRedirect = () => {
  const { user, profile, isLoading: authLoading, isAdmin } = useSimpleAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingRequired();
  const [forceShowContent, setForceShowContent] = useState(false);
  
  const totalLoading = authLoading || onboardingLoading;
  
  // Enhanced loading com timeout robusto
  const { hasTimedOut, retry } = useLoadingTimeoutEnhanced({
    isLoading: totalLoading,
    timeoutMs: 8000, // Aumentado para 8 segundos
    context: 'root_redirect',
    onTimeout: () => {
      console.error('[DEBUG-ROOT-REDIRECT] ⏰ TIMEOUT - Carregamento demorou mais que 8s');
      logger.warn('[ROBUST-ROOT-REDIRECT] ⏰ Timeout no carregamento inicial');
    }
  });

  useEffect(() => {
    const authManager = AuthManager.getInstance();
    
    const handleStateChanged = (authState) => {
      console.log('[DEBUG-ROOT-REDIRECT] 📡 Estado AuthManager atualizado:', {
        hasUser: !!authState.user,
        hasProfile: !!authState.profile,
        isLoading: authState.isLoading,
        isAdmin: authState.isAdmin,
        onboardingRequired: authState.onboardingRequired,
        userRole: authState.profile?.user_roles?.name
      });
    };

    const unsubscribe = authManager.on('stateChanged', handleStateChanged);

    return () => {
      authManager.off('stateChanged', handleStateChanged);
    };
  }, []);

  // Log detalhado do estado atual
  console.log("[DEBUG-ROOT-REDIRECT] 📊 Estado atual:", {
    hasUser: !!user,
    hasProfile: !!profile,
    authLoading,
    onboardingLoading,
    onboardingRequired,
    totalLoading,
    hasTimedOut,
    isAdmin,
    userRole: profile?.user_roles?.name,
    forceShowContent
  });
  
  // Tratamento de timeout com opções de recovery
  if (hasTimedOut && !forceShowContent) {
    console.error('[DEBUG-ROOT-REDIRECT] 🚨 TIMEOUT CRÍTICO - Mostrando tela de recovery');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-[#151823] flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-red-400 text-2xl font-bold">
            ⚠️ Carregamento demorado
          </div>
          <div className="text-neutral-300 space-y-2">
            <p>A aplicação está demorando para carregar.</p>
            <p className="text-sm text-neutral-400">
              Estado atual: {user ? 'Usuário logado' : 'Sem usuário'}, 
              {profile ? 'Perfil carregado' : 'Perfil não carregado'}
            </p>
          </div>
          <div className="space-y-3">
            <button 
              onClick={() => {
                console.log('[DEBUG-ROOT-REDIRECT] 🔄 Forçando continuação...');
                setForceShowContent(true);
              }}
              className="block w-full bg-viverblue hover:bg-viverblue/80 text-white px-6 py-3 rounded-lg font-medium"
            >
              🚀 Continuar mesmo assim
            </button>
            <button 
              onClick={() => {
                console.log('[DEBUG-ROOT-REDIRECT] 🔄 Tentando novamente...');
                retry();
              }}
              className="block w-full bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium"
            >
              🔄 Tentar Novamente
            </button>
            <div className="text-sm text-neutral-400">
              ou{" "}
              <button 
                onClick={() => {
                  console.log('[DEBUG-ROOT-REDIRECT] 🔄 Redirecionando para login...');
                  window.location.href = '/login';
                }}
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
  if (totalLoading && !forceShowContent) {
    console.log('[DEBUG-ROOT-REDIRECT] ⏳ Aguardando carregamento...');
    return <LoadingScreen message="Verificando seu acesso..." />;
  }
  
  if (!user) {
    console.log("[DEBUG-ROOT-REDIRECT] 👤 Sem usuário -> redirecionando para login");
    logger.info("[ROBUST-ROOT-REDIRECT] Sem usuário -> login");
    return <Navigate to="/login" replace />;
  }
  
  // CORREÇÃO CRÍTICA: Admin bypass ABSOLUTO - primeira prioridade
  if (isAdmin) {
    console.log("[DEBUG-ROOT-REDIRECT] 👑 ADMIN DETECTADO - Redirecionamento direto para /admin", {
      userId: user.id.substring(0, 8) + '***',
      userRole: profile?.user_roles?.name,
      onboardingRequired: onboardingRequired,
      bypassReason: 'ADMIN_PRIORITY_ABSOLUTE'
    });
    logger.info("[ROBUST-ROOT-REDIRECT] 👑 ADMIN DETECTADO - Redirecionamento direto para /admin");
    return <Navigate to="/admin" replace />;
  }
  
  // Aguardar perfil se necessário (só para não-admin)
  if (user && !profile && !forceShowContent) {
    console.log("[DEBUG-ROOT-REDIRECT] ⏳ Aguardando perfil...");
    logger.info("[ROBUST-ROOT-REDIRECT] Aguardando perfil...");
    return <LoadingScreen message="Carregando perfil..." />;
  }
  
  // Usar AuthManager.getRedirectPath() para outros casos (não-admin)
  const authManager = AuthManager.getInstance();
  const redirectPath = authManager.getRedirectPath();
  
  console.log("[DEBUG-ROOT-REDIRECT] 🎯 Redirecionamento calculado:", {
    redirectPath,
    hasUser: !!user,
    hasProfile: !!profile,
    onboardingRequired,
    isAdmin,
    roleName: profile?.user_roles?.name,
    reason: isAdmin ? 'ADMIN_BYPASS' : 'NORMAL_FLOW'
  });
  
  logger.info("[ROBUST-ROOT-REDIRECT] Redirecionamento calculado:", {
    redirectPath,
    roleName: profile?.user_roles?.name
  });
  
  return <Navigate to={redirectPath} replace />;
};

export default RobustRootRedirect;
