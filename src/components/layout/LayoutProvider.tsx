
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, ReactNode, memo, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import MemberLayout from "./MemberLayout";
import FormacaoLayout from "./formacao/FormacaoLayout";
import { PageTransitionWithFallback } from "@/components/transitions/PageTransitionWithFallback";

/**
 * LayoutProvider simplificado - remove timeouts excessivos e circuit breakers
 */
const LayoutProvider = memo(({ children }: { children: ReactNode }) => {
  const {
    user,
    profile,
    isAdmin,
    isFormacao,
    isLoading,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [layoutReady, setLayoutReady] = useState(false);

  // Memoizar as verificações de rota
  const routeChecks = useMemo(() => ({
    isFormacaoRoute: location.pathname.startsWith('/formacao'),
    isLearningRoute: location.pathname.startsWith('/learning')
  }), [location.pathname]);

  // Memoizar a mensagem de loading
  const loadingMessage = useMemo(() => {
    if (isLoading) return "Preparando seu dashboard...";
    if (!user) return "Verificando autenticação...";
    return "Carregando layout...";
  }, [isLoading, user]);

  // Lógica simplificada sem timeouts complexos
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }
      setLayoutReady(true);
    }
  }, [user, isLoading, navigate]);

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

  // Mostrar loading
  return (
    <PageTransitionWithFallback isVisible={true}>
      <LoadingScreen message={loadingMessage} />
    </PageTransitionWithFallback>
  );
});

LayoutProvider.displayName = 'LayoutProvider';

export default LayoutProvider;
