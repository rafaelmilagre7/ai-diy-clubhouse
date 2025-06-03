
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
  const { user, isAdmin, isFormacao, isLoading: authLoading } = useAuth();
  const { isOnboardingComplete, isLoading: onboardingLoading } = useUnifiedOnboardingValidation();
  const navigate = useNavigate();
  const location = useLocation();
  const [redirectHandled, setRedirectHandled] = useState(false);

  // Rotas que não precisam de layout
  const isOnboardingRoute = location.pathname.startsWith('/onboarding');
  const isFormacaoRoute = location.pathname.startsWith('/formacao');
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/';

  useEffect(() => {
    if (authLoading || onboardingLoading || redirectHandled) {
      return;
    }

    // Se não há usuário, ir para login
    if (!user && !isAuthRoute) {
      navigate('/login', { replace: true });
      setRedirectHandled(true);
      return;
    }

    // Se usuário logado mas onboarding incompleto, ir para onboarding
    if (user && !isOnboardingComplete && !isOnboardingRoute && !isAuthRoute) {
      navigate('/onboarding-new', { replace: true });
      setRedirectHandled(true);
      return;
    }

    setRedirectHandled(true);
  }, [user, isOnboardingComplete, authLoading, onboardingLoading, isOnboardingRoute, isAuthRoute, navigate, redirectHandled]);

  // Loading state
  if (authLoading || onboardingLoading || !redirectHandled) {
    return <LoadingScreen message="Carregando..." />;
  }

  // Se não há usuário ou está em rota de onboarding, renderizar sem layout
  if (!user || isOnboardingRoute) {
    return (
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    );
  }

  // Layout para formação
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
