
import { useLocation } from "react-router-dom";
import { ReactNode, memo } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import MemberLayout from "./MemberLayout";
import FormacaoLayout from "./formacao/FormacaoLayout";
import { PageTransitionWithFallback } from "@/components/transitions/PageTransitionWithFallback";

const LayoutProvider = memo(({ children }: { children: ReactNode }) => {
  const { user, isFormacao, isAdmin, isLoading } = useAuth();
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

  if (isLoading) {
    return (
      <PageTransitionWithFallback isVisible={true}>
        <LoadingScreen message="Carregando..." />
      </PageTransitionWithFallback>
    );
  }

  if (!user) {
    return (
      <PageTransitionWithFallback isVisible={true}>
        <LoadingScreen message="Verificando autenticação..." />
      </PageTransitionWithFallback>
    );
  }

  // Escolher layout baseado na rota
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
});

LayoutProvider.displayName = 'LayoutProvider';

export default LayoutProvider;
