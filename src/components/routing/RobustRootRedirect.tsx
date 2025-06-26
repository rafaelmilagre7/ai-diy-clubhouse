
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
    
    logger.info('[ROOT-REDIRECT] 🔗 Conectando ao AuthManager CORRIGIDO', {
      component: 'RobustRootRedirect',
      action: 'connect_auth_manager'
    });

    // Subscribe to auth state changes
    const unsubscribe = authManager.on('stateChanged', (newState) => {
      logger.info('[ROOT-REDIRECT] 📡 Estado atualizado via AuthManager', {
        component: 'RobustRootRedirect',
        action: 'state_updated',
        hasUser: !!newState.user,
        isAdmin: newState.isAdmin,
        isLoading: newState.isLoading,
        onboardingRequired: newState.onboardingRequired,
        error: newState.error
      });
      setAuthState(newState);
    });

    // Handle timeout - emergência apenas após timeout do AuthManager
    const timeoutUnsubscribe = authManager.on('timeout', () => {
      logger.warn('[ROOT-REDIRECT] 🚨 Timeout do AuthManager detectado', {
        component: 'RobustRootRedirect',
        action: 'auth_manager_timeout'
      });
      setTimeout(() => {
        if (authState.isLoading) {
          logger.error('[ROOT-REDIRECT] 🚨 Ativando modo emergência após timeout', {
            component: 'RobustRootRedirect',
            action: 'emergency_mode_activated'
          });
          setEmergencyMode(true);
        }
      }, 2000); // 2s após timeout do AuthManager
    });

    // Force initialization if not already initialized
    const initializeIfNeeded = async () => {
      if (!authManager.isInitialized()) {
        logger.info('[ROOT-REDIRECT] 🚀 Inicializando AuthManager', {
          component: 'RobustRootRedirect',
          action: 'initialize_auth_manager'
        });
        try {
          await authManager.initialize();
          setAuthState(authManager.getState());
        } catch (error) {
          logger.error('[ROOT-REDIRECT] ❌ Erro na inicialização', error, {
            component: 'RobustRootRedirect',
            action: 'initialize_error'
          });
          setAuthState(prev => ({ ...prev, isLoading: false, error: (error as Error).message }));
        }
      } else {
        // Se já inicializado, garantir que temos o estado atual
        setAuthState(authManager.getState());
      }
    };

    initializeIfNeeded();

    return () => {
      unsubscribe();
      timeoutUnsubscribe();
    };
  }, []);

  // MODO DE EMERGÊNCIA (apenas após timeout + delay)
  if (emergencyMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
        <div className="text-center text-white p-8 max-w-lg">
          <h2 className="text-2xl font-bold mb-4">🚨 Modo de Emergência</h2>
          <p className="text-gray-300 mb-6">
            O AuthManager não conseguiu inicializar completamente. Tente uma dessas opções:
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

  // Erro de auth persistente
  if (authState.error && !authState.isLoading) {
    logger.error('[ROOT-REDIRECT] ❌ Erro persistente', new Error(authState.error), {
      component: 'RobustRootRedirect',
      action: 'persistent_error',
      error: authState.error
    });
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
        <div className="text-center text-white p-8">
          <h2 className="text-xl font-bold mb-4">❌ Erro de Autenticação</h2>
          <p className="text-gray-300 mb-4">{authState.error}</p>
          <div className="space-y-3">
            <Button
              onClick={() => window.location.href = '/login'}
              className="bg-[#0ABAB5] text-white px-6 py-2 rounded-lg hover:bg-[#089a96] transition-colors"
            >
              Ir para Login
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="ghost"
              className="w-full"
            >
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading - com timeout visual
  if (authState.isLoading) {
    return <LoadingScreen message="Verificando credenciais..." />;
  }

  // LÓGICA DE REDIRECIONAMENTO usando AuthManager
  const redirectPath = AuthManager.getInstance().getRedirectPath();
  
  logger.info('[ROOT-REDIRECT] 🎯 Redirecionamento determinado pelo AuthManager', {
    component: 'RobustRootRedirect',
    action: 'redirect_determined',
    path: redirectPath,
    hasUser: !!authState.user,
    isAdmin: authState.isAdmin,
    onboardingRequired: authState.onboardingRequired
  });

  return <Navigate to={redirectPath} replace />;
};

export default RobustRootRedirect;
