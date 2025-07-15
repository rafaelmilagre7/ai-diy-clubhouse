
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

  // Memoizar as verificações de rota para evitar recálculos desnecessários
  const routeChecks = useMemo(() => ({
    isLearningRoute: location.pathname.startsWith('/learning'),
    isPathAdmin: location.pathname.startsWith('/admin'),
    isPathFormacao: location.pathname.startsWith('/formacao'),
    isFormacaoRoute: location.pathname.startsWith('/formacao')
  }), [location.pathname]);

  // Memoizar a mensagem de loading baseada no estado
  const loadingMessage = useMemo(() => {
    if (isLoading) return "Preparando seu dashboard...";
    if (!user) return "Verificando autenticação...";
    return "Carregando layout...";
  }, [isLoading, user]);

  // OTIMIZAÇÃO: Verificação mais simples e sem conflitos
  useEffect(() => {
    // Limpar qualquer timeout existente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Se não estiver carregando, verificar autenticação
    if (!isLoading) {
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }
      
      // Se temos usuário, marcar layout como pronto
      setLayoutReady(true);
      
      // REMOÇÃO: Não fazer redirecionamentos automáticos aqui
      // O RootRedirect já cuida disso de forma mais inteligente
      
    } else {
      // Timeout reduzido para não interferir no fluxo
      timeoutRef.current = window.setTimeout(() => {
        setLayoutReady(true);
      }, 1500); // Reduzido de 2000 para 1500ms
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user, isLoading, navigate]); // Removidas dependências desnecessárias

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
