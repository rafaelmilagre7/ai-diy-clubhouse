
import { useLocation } from "react-router-dom";
import { useEffect, useState, useRef, ReactNode } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import MemberLayout from "./MemberLayout";
import FormacaoLayout from "./formacao/FormacaoLayout";
import { PageTransitionWithFallback } from "@/components/transitions/PageTransitionWithFallback";

/**
 * LayoutProvider gerencia renderização dos layouts com base no papel do usuário
 * e na rota atual, sem interferir na navegação do React Router
 */
const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const {
    user,
    profile,
    isAdmin,
    isFormacao,
    isLoading,
  } = useAuth();
  const location = useLocation();
  const [layoutReady, setLayoutReady] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  
  // Debug logs
  console.log("LayoutProvider state:", { 
    user: !!user, 
    profile: !!profile, 
    isAdmin, 
    isFormacao, 
    isLoading, 
    layoutReady,
    currentPath: location.pathname
  });

  // Verificar quando os dados estiverem prontos para renderizar o layout
  useEffect(() => {
    // Limpar qualquer timeout existente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Se não estiver carregando e temos usuário, o layout está pronto
    if (!isLoading && user) {
      console.log("LayoutProvider: Usuário autenticado, layout pronto");
      setLayoutReady(true);
      return;
    }
    
    // Se ainda está carregando, configurar timeout
    if (isLoading) {
      timeoutRef.current = window.setTimeout(() => {
        console.log("LayoutProvider: Loading timeout exceeded");
        setLayoutReady(true);
      }, 2000);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user, isLoading]);

  // Verificar se estamos em páginas de formação
  const isFormacaoRoute = location.pathname.startsWith('/formacao');

  console.log("Tipo de rota:", { isFormacaoRoute });

  // Se o layout está pronto, renderizar com base na rota
  if (layoutReady && user) {
    // Para rotas de formação, usar o FormacaoLayout
    if (isFormacaoRoute && (isFormacao || isAdmin)) {
      console.log("LayoutProvider: Renderizando FormacaoLayout");
      return (
        <PageTransitionWithFallback isVisible={true}>
          <FormacaoLayout>{children}</FormacaoLayout>
        </PageTransitionWithFallback>
      );
    } 
    // Para todas as outras rotas, usar o MemberLayout
    else {
      console.log("LayoutProvider: Renderizando MemberLayout");
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
      <LoadingScreen message={
        isLoading ? "Preparando seu dashboard..." : 
        !user ? "Verificando autenticação..." : 
        "Carregando layout..."
      } />
    </PageTransitionWithFallback>
  );
};

export default LayoutProvider;
