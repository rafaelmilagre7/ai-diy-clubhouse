
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
  const [hasInitialized, setHasInitialized] = useState(false);

  // Detectar tipo de rota
  const isOnboardingRoute = location.pathname.startsWith('/onboarding') || location.pathname.startsWith('/simple-onboarding');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isFormacaoRoute = location.pathname.startsWith('/formacao');
  const isLoginRoute = location.pathname === '/login';
  const isRootRoute = location.pathname === '/';

  useEffect(() => {
    // Aguardar carregamento inicial
    if (authLoading || onboardingLoading) {
      return;
    }

    // Evitar múltiplos redirecionamentos
    if (hasInitialized) {
      return;
    }

    console.log('🔄 LayoutProviderNew: Verificando redirecionamento', {
      user: !!user,
      isOnboardingComplete,
      currentPath: location.pathname,
      isAdmin,
      isOnboardingRoute,
      isLoginRoute
    });

    // Se não há usuário e não está em rota de login, ir para login
    if (!user && !isLoginRoute && !isOnboardingRoute) {
      console.log('🔄 Redirecionando para login - usuário não autenticado');
      navigate('/login', { replace: true });
      setHasInitialized(true);
      return;
    }

    // Se usuário logado mas onboarding incompleto (exceto admin), ir para onboarding
    if (user && !isOnboardingComplete && !isOnboardingRoute && !isAdmin) {
      console.log('🔄 Redirecionando para onboarding - onboarding incompleto');
      navigate('/simple-onboarding', { replace: true });
      setHasInitialized(true);
      return;
    }

    // Se usuário está na raiz e autenticado, ir para dashboard
    if (user && isRootRoute) {
      console.log('🔄 Redirecionando para dashboard - usuário na raiz');
      navigate('/dashboard', { replace: true });
      setHasInitialized(true);
      return;
    }

    setHasInitialized(true);
  }, [user, isOnboardingComplete, authLoading, onboardingLoading, location.pathname, isAdmin, navigate, hasInitialized, isOnboardingRoute, isLoginRoute, isRootRoute]);

  // Loading state
  if (authLoading || onboardingLoading || !hasInitialized) {
    return <LoadingScreen message="Carregando aplicação..." />;
  }

  // Se não há usuário ou está em rota de onboarding/login, renderizar sem layout
  if (!user || isOnboardingRoute || isLoginRoute) {
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
