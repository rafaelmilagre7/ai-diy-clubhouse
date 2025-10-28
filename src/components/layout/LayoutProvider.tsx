
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, ReactNode, memo, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
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
    isLoading,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [layoutReady, setLayoutReady] = useState(false);
  const timeoutRef = useRef<number | null>(null);


  // Verificações de rota simplificadas (não precisam de memo para operações tão simples)
  const isFormacaoRoute = location.pathname.startsWith('/formacao');
  const isLearningRoute = location.pathname.startsWith('/learning');

  // Lógica de autenticação otimizada - sem timeouts desnecessários
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (!isLoading) {
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }
      // Layout pronto quando temos usuário (mesmo sem profile)
      setLayoutReady(true);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user, isLoading, navigate]);

  // Renderização condicional otimizada
  if (layoutReady && user) {
    if (isFormacaoRoute && (isFormacao || isAdmin)) {
      return (
        <PageTransitionWithFallback isVisible={true}>
          <FormacaoLayout>{children}</FormacaoLayout>
        </PageTransitionWithFallback>
      );
    }
    
    if (isLearningRoute || !isFormacao || isAdmin) {
      return (
        <PageTransitionWithFallback isVisible={true}>
          <MemberLayout>{children}</MemberLayout>
        </PageTransitionWithFallback>
      );
    }
  }

  // Loading state com mensagem apropriada
  const loadingMessage = isLoading 
    ? "Preparando seu dashboard..." 
    : !user 
    ? "Verificando autenticação..." 
    : "Carregando layout...";
  
  return (
    <PageTransitionWithFallback isVisible={true}>
      <LoadingScreen message={loadingMessage} />
    </PageTransitionWithFallback>
  );
});

LayoutProvider.displayName = 'LayoutProvider';

export default LayoutProvider;
