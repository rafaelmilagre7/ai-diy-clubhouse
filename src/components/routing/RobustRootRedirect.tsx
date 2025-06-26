
import { Navigate } from "react-router-dom";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import { useOnboardingRequired } from "@/hooks/useOnboardingRequired";
import LoadingScreen from "@/components/common/LoadingScreen";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { logger } from "@/utils/logger";

const RobustRootRedirect = () => {
  const { user, profile, isLoading: authLoading, error: authError, isAdmin } = useSimpleAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingRequired();
  const [forceRedirect, setForceRedirect] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  
  const totalLoading = authLoading || onboardingLoading;

  // TIMEOUT AGRESSIVO: 3 segundos
  useEffect(() => {
    const aggressiveTimeout = setTimeout(() => {
      logger.warn('[ROOT-REDIRECT] ⏰ TIMEOUT 3s - forçando redirecionamento', {
        hasUser: !!user,
        hasProfile: !!profile,
        userRole: profile?.user_roles?.name || null,
        isAdmin,
        authLoading,
        onboardingLoading,
        onboardingRequired,
        authError
      });
      setForceRedirect(true);
    }, 3000);

    return () => clearTimeout(aggressiveTimeout);
  }, [user, profile, isAdmin, authLoading, onboardingLoading, onboardingRequired, authError]);

  // TIMEOUT DE EMERGÊNCIA: 6 segundos
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      logger.error('[ROOT-REDIRECT] 🚨 EMERGÊNCIA 6s - ativando modo de emergência', {});
      setEmergencyMode(true);
    }, 6000);

    return () => clearTimeout(emergencyTimeout);
  }, []);

  logger.info('[ROOT-REDIRECT] Estado atual', {
    hasUser: !!user,
    hasProfile: !!profile,
    userRole: profile?.user_roles?.name || null,
    isAdmin,
    authLoading,
    onboardingLoading,
    onboardingRequired,
    authError,
    forceRedirect,
    emergencyMode
  });

  // MODO DE EMERGÊNCIA
  if (emergencyMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
        <div className="text-center text-white p-8 max-w-lg">
          <h2 className="text-2xl font-bold mb-4">🚨 Modo de Emergência</h2>
          <p className="text-gray-300 mb-6">
            A aplicação está demorando muito para carregar. Você pode tentar uma dessas opções:
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-[#0ABAB5] text-white hover:bg-[#089a96]"
            >
              Ir para Login
            </Button>
            
            <Button
              onClick={() => window.location.href = '/dashboard'}
              variant="outline"
              className="w-full"
            >
              Tentar Dashboard
            </Button>
            
            <Button
              onClick={() => window.location.reload()}
              variant="ghost"
              className="w-full"
            >
              Recarregar Página
            </Button>
          </div>
          
          {authError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-300 text-sm">
              Erro: {authError}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Erro de auth com opções
  if (authError) {
    logger.error('[ROOT-REDIRECT] ❌ Erro de auth', authError);
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
        <div className="text-center text-white p-8">
          <h2 className="text-xl font-bold mb-4">❌ Erro de Autenticação</h2>
          <p className="text-gray-300 mb-6">{authError}</p>
          <div className="space-y-3">
            <Button
              onClick={() => window.location.href = '/login'}
              className="bg-[#0ABAB5] text-white px-6 py-2 rounded-lg hover:bg-[#089a96] transition-colors"
            >
              Ir para Login
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading com timeout ou forçar redirecionamento
  if (totalLoading && !forceRedirect) {
    const loadingMessage = authLoading ? 'Verificando suas credenciais...' : 'Verificando seu progresso...';
    return <LoadingScreen message={loadingMessage} />;
  }

  // LÓGICA DE REDIRECIONAMENTO FORÇADA OU NORMAL
  
  // Sem usuário = login (NOVO PADRÃO: /login)
  if (!user) {
    logger.info('[ROOT-REDIRECT] 🔓 Sem usuário -> redirecionando para /login');
    return <Navigate to="/login" replace />;
  }

  // Aguardar perfil apenas se não forçou
  if (user && !profile && !forceRedirect) {
    logger.warn('[ROOT-REDIRECT] ⏳ Aguardando perfil do usuário');
    return <LoadingScreen message="Carregando seu perfil..." />;
  }

  // FLUXO ADMIN SIMPLIFICADO: Admin vai direto para /admin
  if (isAdmin || (profile?.user_roles?.name === 'admin')) {
    logger.info('[ROOT-REDIRECT] 👑 Admin -> /admin (sem onboarding)');
    return <Navigate to="/admin" replace />;
  }

  // Para outros usuários: verificar onboarding
  if (onboardingRequired && !forceRedirect) {
    logger.info('[ROOT-REDIRECT] 📋 Onboarding obrigatório -> /onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  // Determinar rota baseada no papel do usuário
  const userRole = profile?.user_roles?.name;
  
  if (userRole === 'formacao') {
    logger.info('[ROOT-REDIRECT] 🎓 Usuário formação -> /formacao');
    return <Navigate to="/formacao" replace />;
  }

  // Padrão = dashboard
  logger.info('[ROOT-REDIRECT] 🏠 Redirecionamento padrão -> /dashboard');
  return <Navigate to="/dashboard" replace />;
};

export default RobustRootRedirect;
