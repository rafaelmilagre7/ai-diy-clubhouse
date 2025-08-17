
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

  // DEBUG: Log estado do usuário
  console.log('🔍 [LAYOUT] Estado atual:', {
    userEmail: user?.email,
    profileRole: profile?.user_roles?.name,
    isAdmin,
    isFormacao,
    isLoading,
    pathname: location.pathname
  });

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

  // OTIMIZAÇÃO: Simplificação para evitar conflitos com RootRedirect
  useEffect(() => {
    // Limpar timeout existente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Simplificar verificação
    if (!isLoading) {
      if (!user) {
        // Apenas navegar para login se não tiver usuário
        navigate('/login', { replace: true });
        return;
      }
      
      // Marcar layout como pronto imediatamente
      setLayoutReady(true);
    } else {
      // Timeout sincronizado com outros componentes
      timeoutRef.current = window.setTimeout(() => {
        setLayoutReady(true);
      }, 1500); // Sincronizado com AdminLayout e RootRedirect
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user, isLoading, navigate]);

  // Renderizar com base na rota e permissões
  if (layoutReady && user) {
    const { isFormacaoRoute, isLearningRoute } = routeChecks;
    
    // DEBUG: Log da decisão do layout
    console.log('🎯 [LAYOUT] Decidindo layout:', {
      isFormacaoRoute,
      isLearningRoute,
      isFormacao,
      isAdmin,
      willUseFormacaoLayout: isFormacaoRoute && (isFormacao || isAdmin),
      willUseMemberLayout: isLearningRoute || !isFormacao || isAdmin
    });
    
    if (isFormacaoRoute && (isFormacao || isAdmin)) {
      console.log('✅ [LAYOUT] Renderizando FormacaoLayout');
      return (
        <PageTransitionWithFallback isVisible={true}>
          <FormacaoLayout>{children}</FormacaoLayout>
        </PageTransitionWithFallback>
      );
    } else if (isLearningRoute || !isFormacao || isAdmin) {
      console.log('✅ [LAYOUT] Renderizando MemberLayout');
      return (
        <PageTransitionWithFallback isVisible={true}>
          <MemberLayout>{children}</MemberLayout>
        </PageTransitionWithFallback>
      );
    } else {
      console.log('❌ [LAYOUT] Nenhum layout atende aos critérios');
    }
  }

  // Mostrar loading enquanto o layout não está pronto
  console.log('⏳ [LAYOUT] Mostrando LoadingScreen:', {
    layoutReady,
    userExists: !!user,
    loadingMessage
  });
  
  return (
    <PageTransitionWithFallback isVisible={true}>
      <LoadingScreen message={loadingMessage} />
    </PageTransitionWithFallback>
  );
});

LayoutProvider.displayName = 'LayoutProvider';

export default LayoutProvider;
