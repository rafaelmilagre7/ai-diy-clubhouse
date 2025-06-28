
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

  // CORREÇÃO PRINCIPAL: Condição simplificada - só loading se realmente carregando
  if (isLoading) {
    return (
      <PageTransitionWithFallback isVisible={true}>
        <LoadingScreen message="Verificando credenciais..." showEmergencyButton={false} />
      </PageTransitionWithFallback>
    );
  }

  // Se não há usuário após loading completo, deixar as rotas protegidas redirecionarem
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
        <FormacaoLayout children={children} />
      </PageTransitionWithFallback>
    );
  }

  // Layout padrão para membros
  return (
    <PageTransitionWithFallback isVisible={true}>
      <MemberLayout>
        {children}
      </MemberLayout>
    </PageTransitionWithFallback>
  );
});

LayoutProvider.displayName = 'LayoutProvider';

export default LayoutProvider;
