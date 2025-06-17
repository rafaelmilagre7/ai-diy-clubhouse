
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, ReactNode, memo, useMemo } from "react";
import { useAuth } from "@/contexts/auth/OptimizedAuthContext";
import LoadingScreen from "@/components/common/LoadingScreen";
import MemberLayout from "./MemberLayout";
import FormacaoLayout from "./formacao/FormacaoLayout";
import { PageTransitionWithFallback } from "@/components/transitions/PageTransitionWithFallback";

/**
 * CORREÇÃO: LayoutProvider simplificado sem timeouts complexos
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

  // CORREÇÃO: Verificações de rota mais simples
  const routeChecks = useMemo(() => ({
    isLearningRoute: location.pathname.startsWith('/learning'),
    isPathAdmin: location.pathname.startsWith('/admin'),
    isPathFormacao: location.pathname.startsWith('/formacao'),
    isFormacaoRoute: location.pathname.startsWith('/formacao')
  }), [location.pathname]);

  // CORREÇÃO: Verificação de autenticação simplificada
  useEffect(() => {
    // Se não estiver carregando, verificar autenticação
    if (!isLoading) {
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }
      
      // Se temos usuário, marcar layout como pronto
      setLayoutReady(true);
      
      // CORREÇÃO: Redirecionamento mais simples
      if (user && profile) {
        const { isLearningRoute, isPathAdmin, isPathFormacao } = routeChecks;
        
        if (isAdmin && !isPathAdmin && !isPathFormacao && !isLearningRoute) {
          // Admin pode ir para dashboard membro também
        } 
        else if (isFormacao && !isAdmin && !isPathFormacao && !isLearningRoute) {
          navigate('/formacao', { replace: true });
        }
      }
    } else {
      // CORREÇÃO: Timeout simplificado de 3 segundos
      const timeout = setTimeout(() => {
        setLayoutReady(true);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [user, profile, isAdmin, isFormacao, isLoading, navigate, routeChecks]);

  // CORREÇÃO: Renderização mais direta
  if (layoutReady && user) {
    const { isFormacaoRoute, isLearningRoute } = routeChecks;
    
    if (isFormacaoRoute && (isFormacao || isAdmin)) {
      return (
        <PageTransitionWithFallback isVisible={true}>
          <FormacaoLayout>{children}</FormacaoLayout>
        </PageTransitionWithFallback>
      );
    } else {
      return (
        <PageTransitionWithFallback isVisible={true}>
          <MemberLayout>{children}</MemberLayout>
        </PageTransitionWithFallback>
      );
    }
  }

  // CORREÇÃO: Loading mais simples
  return (
    <PageTransitionWithFallback isVisible={true}>
      <LoadingScreen message="Carregando seu dashboard..." />
    </PageTransitionWithFallback>
  );
});

LayoutProvider.displayName = 'LayoutProvider';

export default LayoutProvider;
