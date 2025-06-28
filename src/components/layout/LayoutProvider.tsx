
import { useLocation } from "react-router-dom";
import { ReactNode, memo } from "react";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import LoadingScreen from "@/components/common/LoadingScreen";
import { MemberLayout } from "./MemberLayout";
import FormacaoLayout from "./formacao/FormacaoLayout";
import { PageTransitionWithFallback } from "@/components/transitions/PageTransitionWithFallback";

interface LayoutProviderProps {
  children: ReactNode;
}

const LayoutProvider = memo(({ children }: LayoutProviderProps) => {
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

  // Só mostrar loading se realmente não tem dados do usuário E está carregando
  if (isLoading && !user) {
    return (
      <PageTransitionWithFallback isVisible={true}>
        <LoadingScreen message="Carregando..." showEmergencyButton={false} />
      </PageTransitionWithFallback>
    );
  }

  // Se não há usuário (após loading), redirecionar será feito pelas rotas protegidas
  if (!user) {
    return (
      <PageTransitionWithFallback isVisible={true}>
        <LoadingScreen message="Redirecionando..." showEmergencyButton={false} />
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
