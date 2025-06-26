
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import LoadingScreen from "@/components/common/LoadingScreen";
import AuthManager from "@/services/AuthManager";
import { logger } from "@/utils/logger";

const RobustRootRedirect = () => {
  const [authState, setAuthState] = useState(() => AuthManager.getInstance().getState());
  const [emergencyMode, setEmergencyMode] = useState(false);

  useEffect(() => {
    const authManager = AuthManager.getInstance();
    
    logger.info('[ROOT-REDIRECT] 🔗 Conectando ao AuthManager CENTRALIZADO');

    // Subscribe to auth state changes
    const unsubscribe = authManager.on('stateChanged', (newState) => {
      logger.info('[ROOT-REDIRECT] 📡 Estado atualizado:', {
        hasUser: !!newState.user,
        isAdmin: newState.isAdmin,
        isLoading: newState.isLoading,
        onboardingRequired: newState.onboardingRequired
      });
      setAuthState(newState);
    });

    // Handle timeout - emergência apenas após 8 segundos
    const emergencyTimeout = authManager.on('timeout', () => {
      logger.warn('[ROOT-REDIRECT] 🚨 Timeout detectado - ativando modo emergência em 3s');
      setTimeout(() => setEmergencyMode(true), 3000);
    });

    // Initialize if needed
    if (!authManager.isInitialized()) {
      authManager.initialize();
    }

    return () => {
      unsubscribe();
      emergencyTimeout();
    };
  }, []);

  // MODO DE EMERGÊNCIA (apenas após timeout + 3s)
  if (emergencyMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
        <div className="text-center text-white p-8 max-w-lg">
          <h2 className="text-2xl font-bold mb-4">🚨 Modo de Emergência</h2>
          <p className="text-gray-300 mb-6">
            O AuthManager não conseguiu inicializar. Tente uma dessas opções:
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-[#0ABAB5] text-white hover:bg-[#089a96]"
            >
              Ir para Login
            </Button>
            
            <Button
              onClick={() => window.location.reload()}
              variant="ghost"
              className="w-full"
            >
              Recarregar Página
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Erro de auth
  if (authState.error && !authState.isLoading) {
    logger.error('[ROOT-REDIRECT] ❌ Erro de auth:', authState.error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
        <div className="text-center text-white p-8">
          <h2 className="text-xl font-bold mb-4">❌ Erro de Autenticação</h2>
          <p className="text-gray-300 mb-6">{authState.error}</p>
          <Button
            onClick={() => window.location.href = '/login'}
            className="bg-[#0ABAB5] text-white px-6 py-2 rounded-lg hover:bg-[#089a96] transition-colors"
          >
            Ir para Login
          </Button>
        </div>
      </div>
    );
  }

  // Loading
  if (authState.isLoading) {
    return <LoadingScreen message="Inicializando AuthManager..." />;
  }

  // LÓGICA DE REDIRECIONAMENTO DETERMINÍSTICA usando AuthManager
  const redirectPath = AuthManager.getInstance().getRedirectPath();
  
  logger.info('[ROOT-REDIRECT] 🎯 Redirecionamento determinado:', {
    path: redirectPath,
    hasUser: !!authState.user,
    isAdmin: authState.isAdmin,
    onboardingRequired: authState.onboardingRequired
  });

  return <Navigate to={redirectPath} replace />;
};

export default RobustRootRedirect;
