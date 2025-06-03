
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, ReactNode, memo, useMemo } from "react";
import { useOptimizedAuth } from "@/hooks/auth/useOptimizedAuth";
import { useUnifiedOnboardingValidation } from "@/hooks/onboarding/useUnifiedOnboardingValidation";
import LoadingScreen from "@/components/common/LoadingScreen";
import MemberLayout from "./MemberLayout";
import FormacaoLayout from "./formacao/FormacaoLayout";
import { PageTransitionWithFallback } from "@/components/transitions/PageTransitionWithFallback";
import AppRoutes from "@/components/routing/AppRoutes";

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
    isLearningRoute: location.pathname.startsWith('/learning') || location.pathname.startsWith('/aprendizado'),
    isPathAdmin: location.pathname.startsWith('/admin'),
    isPathFormacao: location.pathname.startsWith('/formacao'),
    isFormacaoRoute: location.pathname.startsWith('/formacao'),
    isOnboardingRoute: location.pathname.startsWith('/onboarding'),
    isMemberRoute: !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/formacao') && !location.pathname.startsWith('/onboarding')
  }), [location.pathname]);

  // Memoizar mensagem de loading
  const loadingMessage = useMemo(() => {
    if (authLoading) return "Preparando seu dashboard...";
    if (onboardingLoading) return "Verificando onboarding...";
    if (!user) return "Verificando autenticação...";
    return "Carregando layout...";
  }, [authLoading, onboardingLoading, user]);

  // Verificar autenticação
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (!authLoading && !onboardingLoading) {
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }
      
      if (!routeChecks.isOnboardingRoute && !isOnboardingComplete) {
        navigate('/onboarding-new', { replace: true });
        return;
      }
      
      setLayoutReady(true);
      
      // Verificar redirecionamento por role
      if (user && profile) {
        const { isLearningRoute, isPathAdmin, isPathFormacao } = routeChecks;
        
        if (isAdmin && !isPathAdmin && !isPathFormacao && !isLearningRoute) {
          navigate('/admin', { replace: true });
        } 
        else if (isFormacao && !isAdmin && !isPathFormacao && !isLearningRoute) {
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
    const { isFormacaoRoute, isLearningRoute, isMemberRoute } = routeChecks;
    
    if (isFormacaoRoute && (isFormacao || isAdmin)) {
      return (
        <PageTransitionWithFallback isVisible={true}>
          <FormacaoLayout>
            <AppRoutes />
          </FormacaoLayout>
        </PageTransitionWithFallback>
      );
    } else if (isMemberRoute || isLearningRoute || !isFormacao || isAdmin) {
      return (
        <PageTransitionWithFallback isVisible={true}>
          <MemberLayout>
            <AppRoutes />
          </MemberLayout>
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
