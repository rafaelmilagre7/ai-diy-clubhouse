
import { Navigate } from "react-router-dom";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import { useOnboardingRequired } from "@/hooks/useOnboardingRequired";
import LoadingScreen from "@/components/common/LoadingScreen";
import { logger } from "@/utils/logger";
import { getUserRoleName } from "@/lib/supabase/types";

const RobustRootRedirect = () => {
  const { user, profile, isLoading: authLoading, error: authError } = useSimpleAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingRequired();
  
  const totalLoading = authLoading || onboardingLoading;

  // Log detalhado do estado
  logger.info("[ROOT-REDIRECT] Estado atual:", {
    hasUser: !!user,
    hasProfile: !!profile,
    userRole: profile ? getUserRoleName(profile) : null,
    authLoading,
    onboardingLoading,
    onboardingRequired,
    authError
  });

  // Erro de auth
  if (authError) {
    logger.error("[ROOT-REDIRECT] Erro de auth:", authError);
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
        <div className="text-center text-white p-8">
          <h2 className="text-xl font-bold mb-4">Erro de Autenticação</h2>
          <p className="text-gray-300 mb-6">{authError}</p>
          <button
            onClick={() => window.location.href = '/auth'}
            className="bg-[#0ABAB5] text-white px-6 py-2 rounded-lg hover:bg-[#089a96] transition-colors"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  // Loading normal
  if (totalLoading) {
    const loadingMessage = authLoading ? 'Verificando suas credenciais...' : 'Verificando seu progresso...';
    return <LoadingScreen message={loadingMessage} />;
  }

  // Sem usuário = login
  if (!user) {
    logger.info("[ROOT-REDIRECT] Sem usuário -> redirecionando para auth");
    return <Navigate to="/auth" replace />;
  }

  // Aguardar perfil
  if (user && !profile) {
    logger.warn("[ROOT-REDIRECT] Aguardando perfil do usuário");
    return <LoadingScreen message="Carregando seu perfil..." />;
  }

  // Onboarding obrigatório
  if (onboardingRequired) {
    logger.info("[ROOT-REDIRECT] Onboarding obrigatório -> /onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  // Determinar rota baseada no papel do usuário
  const userRole = getUserRoleName(profile);
  
  if (userRole === 'formacao') {
    logger.info("[ROOT-REDIRECT] Usuário formação -> /formacao");
    return <Navigate to="/formacao" replace />;
  }

  if (userRole === 'admin') {
    logger.info("[ROOT-REDIRECT] Usuário admin -> /admin");
    return <Navigate to="/admin" replace />;
  }

  // Padrão = dashboard
  logger.info("[ROOT-REDIRECT] Redirecionamento padrão -> /dashboard");
  return <Navigate to="/dashboard" replace />;
};

export default RobustRootRedirect;
