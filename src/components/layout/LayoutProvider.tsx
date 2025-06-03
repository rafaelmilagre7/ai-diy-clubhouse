
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

  // CORREÇÃO CRÍTICA: Verificação de autenticação simplificada SEM redirecionamentos automáticos
  useEffect(() => {
    console.log('🔄 LayoutProvider: Verificando autenticação', {
      user: !!user,
      profile: !!profile,
      isAdmin,
      authLoading,
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
      
      setLayoutReady(true);
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
  }, [user, profile, isAdmin, isFormacao, authLoading, onboardingLoading, navigate, routeChecks]);

  // CORREÇÃO: Renderizar layout baseado APENAS na rota e perfil do usuário
  if (layoutReady && user && profile) {
    const { isFormacaoRoute, isLearningRoute } = routeChecks;
    
    // Layout de formação para rotas /formacao se usuário tem permissão
    if (isFormacaoRoute && (isFormacao || isAdmin)) {
      return (
        <PageTransitionWithFallback isVisible={true}>
          <FormacaoLayout>{children}</FormacaoLayout>
        </PageTransitionWithFallback>
      );
    } 
    
    // Layout padrão de membro para todas as outras rotas
    return (
      <PageTransitionWithFallback isVisible={true}>
        <MemberLayout>{children}</MemberLayout>
      </PageTransitionWithFallback>
    );
  }

  return (
    <PageTransitionWithFallback isVisible={true}>
      <LoadingScreen message={loadingMessage} />
    </PageTransitionWithFallback>
  );
});

LayoutProvider.displayName = 'LayoutProvider';

export default LayoutProvider;
