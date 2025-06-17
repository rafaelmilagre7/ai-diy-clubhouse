
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, ReactNode, memo, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
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
    isLoading,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [layoutReady, setLayoutReady] = useState(false);

  // Verificações de rota simplificadas
  const routeChecks = useMemo(() => ({
    isLearningRoute: location.pathname.startsWith('/learning'),
    isPathAdmin: location.pathname.startsWith('/admin'),
    isPathFormacao: location.pathname.startsWith('/formacao'),
    isFormacaoRoute: location.pathname.startsWith('/formacao')
  }), [location.pathname]);

  // Verificação de autenticação simplificada
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }
      
      // Se temos usuário, marcar layout como pronto
      setLayoutReady(true);
      
      // Redirecionamento simplificado
      if (user && profile) {
        const { isLearningRoute, isPathAdmin, isPathFormacao } = routeChecks;
        
        if (isFormacao && !isAdmin && !isPathFormacao && !isLearningRoute) {
          navigate('/formacao', { replace: true });
        }
      }
    } else {
      // Timeout de segurança de 2 segundos
      const timeout = setTimeout(() => {
        setLayoutReady(true);
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [user, profile, isAdmin, isFormacao, isLoading, navigate, routeChecks]);

  // Renderização simplificada
  if (layoutReady && user) {
    const { isFormacaoRoute } = routeChecks;
    
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

  // Loading simples
  return (
    <PageTransitionWithFallback isVisible={true}>
      <LoadingScreen message="Carregando seu dashboard..." />
    </PageTransitionWithFallback>
  );
});

LayoutProvider.displayName = 'LayoutProvider';

export default LayoutProvider;
