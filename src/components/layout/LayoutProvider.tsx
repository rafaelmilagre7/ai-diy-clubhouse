
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, ReactNode, memo, useMemo } from "react";
import { useOptimizedAuth } from "@/hooks/auth/useOptimizedAuth";
import { useUnifiedOnboardingValidation } from "@/hooks/onboarding/useUnifiedOnboardingValidation";
import LoadingScreen from "@/components/common/LoadingScreen";
import MemberLayout from "./MemberLayout";
import FormacaoLayout from "./formacao/FormacaoLayout";
import { PageTransitionWithFallback } from "@/components/transitions/PageTransitionWithFallback";

const LayoutProvider = memo(({ children }: { children: ReactNode }) => {
  const {
    user,
    profile,
    isAdmin,
    isFormacao,
    isLoading: authLoading,
  } = useOptimizedAuth();
  const { isOnboardingComplete, isLoading: onboardingLoading } = useUnifiedOnboardingValidation();
  const navigate = useNavigate();
  const location = useLocation();
  const [layoutReady, setLayoutReady] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // Memoizar verificações de rota
  const routeChecks = useMemo(() => ({
    isLearningRoute: location.pathname.startsWith('/learning'),
    isPathAdmin: location.pathname.startsWith('/admin'),
    isPathFormacao: location.pathname.startsWith('/formacao'),
    isFormacaoRoute: location.pathname.startsWith('/formacao'),
    isOnboardingRoute: location.pathname.startsWith('/onboarding')
  }), [location.pathname]);

  // Memoizar mensagem de loading
  const loadingMessage = useMemo(() => {
    if (authLoading) return "Preparando seu dashboard...";
    if (onboardingLoading) return "Verificando onboarding...";
    if (!user) return "Verificando autenticação...";
    return "Carregando layout...";
  }, [authLoading, onboardingLoading, user]);

  // Verificar autenticação - REMOVIDO O REDIRECIONAMENTO AUTOMÁTICO PARA ONBOARDING
  useEffect(() => {
    console.log('🔄 LayoutProvider: Verificando autenticação e onboarding', {
      user: !!user,
      isAdmin,
      authLoading,
      onboardingLoading,
      isOnboardingComplete,
      currentPath: location.pathname,
      routeChecks
    });

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (!authLoading && !onboardingLoading) {
      if (!user) {
        console.log('❌ LayoutProvider: Usuário não autenticado, redirecionando para login');
        navigate('/login', { replace: true });
        return;
      }
      
      // REMOVIDO O REDIRECIONAMENTO FORÇADO PARA ONBOARDING
      // Esta era a causa do loop de redirecionamento
      // if (!routeChecks.isOnboardingRoute && !isOnboardingComplete) {
      //   navigate('/onboarding-new', { replace: true });
      //   return;
      // }
      
      setLayoutReady(true);
      
      // Verificar redirecionamento por role - APENAS se não estiver em rotas específicas
      if (user && profile && !routeChecks.isOnboardingRoute) {
        const { isLearningRoute, isPathAdmin, isPathFormacao } = routeChecks;
        
        if (isAdmin && !isPathAdmin && !isPathFormacao && !isLearningRoute) {
          console.log('🔄 LayoutProvider: Admin redirecionando para /admin');
          navigate('/admin', { replace: true });
        } 
        else if (isFormacao && !isAdmin && !isPathFormacao && !isLearningRoute) {
          console.log('🔄 LayoutProvider: Formação redirecionando para /formacao');
          navigate('/formacao', { replace: true });
        }
      }
    } else {
      timeoutRef.current = window.setTimeout(() => {
        setLayoutReady(true);
      }, 2000);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user, profile, isAdmin, isFormacao, authLoading, onboardingLoading, isOnboardingComplete, navigate, routeChecks]);

  // Renderizar layout baseado na rota
  if (layoutReady && user) {
    const { isFormacaoRoute, isLearningRoute } = routeChecks;
    
    if (isFormacaoRoute && (isFormacao || isAdmin)) {
      return (
        <PageTransitionWithFallback isVisible={true}>
          <FormacaoLayout>{children}</FormacaoLayout>
        </PageTransitionWithFallback>
      );
    } else if (isLearningRoute || !isFormacao || isAdmin) {
      return (
        <PageTransitionWithFallback isVisible={true}>
          <MemberLayout>{children}</MemberLayout>
        </PageTransitionWithFallback>
      );
    }
  }

  return (
    <PageTransitionWithFallback isVisible={true}>
      <LoadingScreen message={loadingMessage} />
    </PageTransitionWithFallback>
  );
});

LayoutProvider.displayName = 'LayoutProvider';

export default LayoutProvider;
