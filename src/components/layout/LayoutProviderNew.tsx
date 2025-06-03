
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, memo } from "react";
import { useAuth } from "@/contexts/auth";
import { useUnifiedOnboardingValidation } from "@/hooks/onboarding/useUnifiedOnboardingValidation";
import LoadingScreen from "@/components/common/LoadingScreen";
import MemberLayout from "./MemberLayout";
import FormacaoLayout from "./formacao/FormacaoLayout";
import AdminLayout from "./admin/AdminLayout";
import { AppRoutesNew } from "@/routes/AppRoutesNew";
import ErrorBoundary from "@/components/common/ErrorBoundary";

const LayoutProviderNew = memo(() => {
  const { user, isAdmin, isFormacao, isLoading: authLoading } = useAuth();
  const { isOnboardingComplete, isLoading: onboardingLoading } = useUnifiedOnboardingValidation();
  const navigate = useNavigate();
  const location = useLocation();
  const [redirectHandled, setRedirectHandled] = useState(false);

  // Detectar tipo de rota
  const isOnboardingRoute = location.pathname.startsWith('/onboarding') || location.pathname.startsWith('/simple-onboarding');
  const isAdminRoute = location.pathname.startsWith('/admin');
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

    // Se usuário logado mas onboarding incompleto (exceto admin), ir para onboarding
    if (user && !isOnboardingComplete && !isOnboardingRoute && !isAuthRoute && !isAdmin) {
      // Usar simple onboarding por padrão
      navigate('/simple-onboarding', { replace: true });
      setRedirectHandled(true);
      return;
    }

    setRedirectHandled(true);
  }, [user, isOnboardingComplete, authLoading, onboardingLoading, isOnboardingRoute, isAuthRoute, isAdmin, navigate, redirectHandled]);

  // Loading state
  if (authLoading || onboardingLoading || !redirectHandled) {
    return <LoadingScreen message="Carregando..." />;
  }

  // Se não há usuário ou está em rota de onboarding, renderizar sem layout
  if (!user || isOnboardingRoute) {
    return (
      <ErrorBoundary>
        <AppRoutesNew />
      </ErrorBoundary>
    );
  }

  // Layout para admin
  if (isAdminRoute && isAdmin) {
    return (
      <ErrorBoundary>
        <AdminLayout>
          <AppRoutesNew />
        </AdminLayout>
      </ErrorBoundary>
    );
  }

  // Layout para formação
  if (isFormacaoRoute && (isFormacao || isAdmin)) {
    return (
      <ErrorBoundary>
        <FormacaoLayout>
          <AppRoutesNew />
        </FormacaoLayout>
      </ErrorBoundary>
    );
  }

  // Layout padrão para membros
  return (
    <ErrorBoundary>
      <MemberLayout>
        <AppRoutesNew />
      </MemberLayout>
    </ErrorBoundary>
  );
});

LayoutProviderNew.displayName = 'LayoutProviderNew';

export default LayoutProviderNew;
