
import { useLocation } from "react-router-dom";
import { ReactNode, memo, useMemo } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import MemberLayout from "./MemberLayout";
import FormacaoLayout from "./formacao/FormacaoLayout";
import { PageTransitionWithFallback } from "@/components/transitions/PageTransitionWithFallback";

const LayoutProvider = memo(({ children }: { children: ReactNode }) => {
  const { user, isFormacao, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  // Verificações de rota simplificadas
  const isFormacaoRoute = location.pathname.startsWith('/formacao');

  console.log("[LAYOUT-PROVIDER] Estado:", {
    hasUser: !!user,
    isFormacao,
    isAdmin,
    isLoading,
    currentPath: location.pathname,
    isFormacaoRoute
  });

  // Se estiver carregando, mostrar loading
  if (isLoading) {
    return (
      <PageTransitionWithFallback isVisible={true}>
        <LoadingScreen message="Carregando sua área..." />
      </PageTransitionWithFallback>
    );
  }

  // Se não há usuário, o RootRedirect cuidará disso
  if (!user) {
    return (
      <PageTransitionWithFallback isVisible={true}>
        <LoadingScreen message="Verificando autenticação..." />
      </PageTransitionWithFallback>
    );
  }

  // Escolher layout baseado na rota e permissões
  if (isFormacaoRoute && (isFormacao || isAdmin)) {
    console.log("[LAYOUT-PROVIDER] Usando FormacaoLayout");
    return (
      <PageTransitionWithFallback isVisible={true}>
        <FormacaoLayout>{children}</FormacaoLayout>
      </PageTransitionWithFallback>
    );
  } else {
    console.log("[LAYOUT-PROVIDER] Usando MemberLayout");
    return (
      <PageTransitionWithFallback isVisible={true}>
        <MemberLayout>{children}</MemberLayout>
      </PageTransitionWithFallback>
    );
  }
});

LayoutProvider.displayName = 'LayoutProvider';

export default LayoutProvider;
