
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, ReactNode, memo, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import { useSimpleOnboardingValidation } from "@/hooks/onboarding/useSimpleOnboardingValidation";
import LoadingScreen from "@/components/common/LoadingScreen";
import MemberLayout from "./MemberLayout";
import FormacaoLayout from "./formacao/FormacaoLayout";
import { PageTransitionWithFallback } from "@/components/transitions/PageTransitionWithFallback";

/**
 * LayoutProvider gerencia autenticação e roteamento baseado em papéis
 * antes de renderizar o componente de layout apropriado
 */
const LayoutProvider = memo(({ children }: { children: ReactNode }) => {
  const {
    user,
    profile,
    isAdmin,
    isFormacao,
    isLoading: authLoading,
  } = useAuth();
  const { isOnboardingComplete, isLoading: onboardingLoading } = useSimpleOnboardingValidation();
  const navigate = useNavigate();
  const location = useLocation();
  const [layoutReady, setLayoutReady] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // Memoizar as verificações de rota para evitar recálculos desnecessários
  const routeChecks = useMemo(() => ({
    isLearningRoute: location.pathname.startsWith('/learning'),
    isPathAdmin: location.pathname.startsWith('/admin'),
    isPathFormacao: location.pathname.startsWith('/formacao'),
    isFormacaoRoute: location.pathname.startsWith('/formacao'),
    isOnboardingRoute: location.pathname.startsWith('/onboarding')
  }), [location.pathname]);

  // Memoizar a mensagem de loading baseada no estado
  const loadingMessage = useMemo(() => {
    if (authLoading) return "Preparando seu dashboard...";
    if (onboardingLoading) return "Verificando onboarding...";
    if (!user) return "Verificando autenticação...";
    return "Carregando layout...";
  }, [authLoading, onboardingLoading, user]);

  // Verificar autenticação assim que o estado estiver pronto
  useEffect(() => {
    // Limpar qualquer timeout existente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Se não estiver carregando, verificar autenticação
    if (!authLoading && !onboardingLoading) {
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }
      
      // Verificar se precisa redirecionar para onboarding
      if (!routeChecks.isOnboardingRoute && !isOnboardingComplete) {
        navigate('/onboarding-new', { replace: true });
        return;
      }
      
      // Se temos usuário, marcar layout como pronto
      setLayoutReady(true);
      
      // Verificar papel do usuário e rota atual
      if (user && profile) {
        const { isLearningRoute, isPathAdmin, isPathFormacao } = routeChecks;
        
        // Redirecionar apenas se estiver na rota errada
        if (isAdmin && !isPathAdmin && !isPathFormacao && !isLearningRoute) {
          navigate('/admin', { replace: true });
        } 
        else if (isFormacao && !isAdmin && !isPathFormacao && !isLearningRoute) {
          navigate('/formacao', { replace: true });
        }
      }
    } else {
      // Configurar timeout para não ficar preso em carregamento infinito
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

  // Renderizar com base na rota e permissões
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

  // Mostrar loading enquanto o layout não está pronto
  return (
    <PageTransitionWithFallback isVisible={true}>
      <LoadingScreen message={loadingMessage} />
    </PageTransitionWithFallback>
  );
});

LayoutProvider.displayName = 'LayoutProvider';

export default LayoutProvider;
