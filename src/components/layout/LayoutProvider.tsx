
import { useLocation } from "react-router-dom";
import { ReactNode, memo } from "react";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import LoadingScreen from "@/components/common/LoadingScreen";
import MemberLayout from "./MemberLayout";
import FormacaoLayout from "./formacao/FormacaoLayout";
import { PageTransitionWithFallback } from "@/components/transitions/PageTransitionWithFallback";

const LayoutProvider = memo(({ children }: { children: ReactNode }) => {
  const { user, isFormacao, isAdmin, isLoading } = useSimpleAuth();
  const location = useLocation();

  const isFormacaoRoute = location.pathname.startsWith('/formacao');

  console.log("[LAYOUT-PROVIDER] Estado:", {
    hasUser: !!user,
    isFormacao,
    isAdmin,
    isLoading,
    currentPath: location.pathname,
    isFormacaoRoute
  });

  // Aguardar carregamento completo
  if (isLoading) {
    return (
      <PageTransitionWithFallback isVisible={true}>
        <LoadingScreen message="Preparando interface..." />
      </PageTransitionWithFallback>
    );
  }

  // Se não há usuário, mostrar loading (deve redirecionar via ProtectedRoutes)
  if (!user) {
    return (
      <PageTransitionWithFallback isVisible={true}>
        <LoadingScreen message="Verificando autenticação..." />
      </PageTransitionWithFallback>
    );
  }

  // Escolher layout baseado na rota atual
  if (isFormacaoRoute && (isFormacao || isAdmin)) {
    return (
      <PageTransitionWithFallback isVisible={true}>
        <FormacaoLayout>{children}</FormacaoLayout>
      </PageTransitionWithFallback>
    );
  }

  // Layout padrão para membros
  return (
    <PageTransitionWithFallback isVisible={true}>
      <MemberLayout>{children}</MemberLayout>
    </PageTransitionWithFallback>
  );
});

LayoutProvider.displayName = 'LayoutProvider';

export default LayoutProvider;
