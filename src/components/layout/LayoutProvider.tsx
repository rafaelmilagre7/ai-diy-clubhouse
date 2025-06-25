
import { useLocation } from "react-router-dom";
import { ReactNode, memo } from "react";
import { useAuth } from "@/contexts/auth/SimpleAuthProvider";
import LoadingScreen from "@/components/common/LoadingScreen";
import MemberLayout from "./MemberLayout";
import FormacaoLayout from "./formacao/FormacaoLayout";
import { PageTransitionWithFallback } from "@/components/transitions/PageTransitionWithFallback";

const LayoutProvider = memo(({ children }: { children: ReactNode }) => {
  const { user, isFormacao, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  const isFormacaoRoute = location.pathname.startsWith('/formacao');

  // Aguardar carregamento simples
  if (isLoading) {
    return (
      <PageTransitionWithFallback isVisible={true}>
        <LoadingScreen message="Carregando..." />
      </PageTransitionWithFallback>
    );
  }

  // Se não há usuário, mostrar loading (deve redirecionar via SimpleProtectedRoutes)
  if (!user) {
    return (
      <PageTransitionWithFallback isVisible={true}>
        <LoadingScreen message="Redirecionando..." />
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
