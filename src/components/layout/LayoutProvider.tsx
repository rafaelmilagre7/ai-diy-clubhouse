
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, memo } from "react";
import { useAuth } from "@/contexts/auth";
import { useUnifiedOnboardingValidation } from "@/hooks/onboarding/useUnifiedOnboardingValidation";
import LoadingScreen from "@/components/common/LoadingScreen";
import MemberLayout from "./MemberLayout";
import FormacaoLayout from "./formacao/FormacaoLayout";
import AppRoutes from "@/components/routing/AppRoutes";
import ErrorBoundary from "@/components/common/ErrorBoundary";

const LayoutProvider = memo(() => {
  const { user, profile, isAdmin, isFormacao, isLoading: authLoading } = useAuth();
  const { isOnboardingComplete, isLoading: onboardingLoading } = useUnifiedOnboardingValidation();
  const navigate = useNavigate();
  const location = useLocation();
  const [layoutReady, setLayoutReady] = useState(false);

  // Verificações de rota simplificadas
  const isOnboardingRoute = location.pathname.startsWith('/onboarding');
  const isFormacaoRoute = location.pathname.startsWith('/formacao');
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/';

  useEffect(() => {
    // Se ainda está carregando, aguardar
    if (authLoading || onboardingLoading) {
      return;
    }

    // Se não há usuário e não é rota de auth, ir para login
    if (!user && !isAuthRoute) {
      navigate('/login', { replace: true });
      return;
    }

    // Se há usuário mas sem onboarding completo e não está na rota de onboarding
    if (user && !isOnboardingComplete && !isOnboardingRoute && !isAuthRoute) {
      navigate('/onboarding-new', { replace: true });
      return;
    }

    // Layout está pronto
    setLayoutReady(true);
  }, [user, isOnboardingComplete, authLoading, onboardingLoading, isOnboardingRoute, isAuthRoute, navigate]);

  // Mostrar loading enquanto verifica
  if (!layoutReady || authLoading || onboardingLoading) {
    return <LoadingScreen message="Carregando..." />;
  }

  // Se não há usuário, deixar AppRoutes lidar com o roteamento
  if (!user) {
    return (
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    );
  }

  // Escolher layout baseado na rota e papel do usuário
  if (isFormacaoRoute && (isFormacao || isAdmin)) {
    return (
      <ErrorBoundary>
        <FormacaoLayout>
          <AppRoutes />
        </FormacaoLayout>
      </ErrorBoundary>
    );
  }

  // Layout padrão para membros
  return (
    <ErrorBoundary>
      <MemberLayout>
        <AppRoutes />
      </MemberLayout>
    </ErrorBoundary>
  );
});

LayoutProvider.displayName = 'LayoutProvider';

export default LayoutProvider;
