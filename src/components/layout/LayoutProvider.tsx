
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, ReactNode } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import MemberLayout from "./MemberLayout";
import FormacaoLayout from "./formacao/FormacaoLayout";
import { toast } from "sonner";
import { PageTransitionWithFallback } from "@/components/transitions/PageTransitionWithFallback";

/**
 * LayoutProvider gerencia autenticação e roteamento baseado em papéis
 * antes de renderizar o componente de layout apropriado
 */
const LayoutProvider = ({ children }: { children: ReactNode }) => {
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

  // Verificar autenticação assim que o estado estiver pronto
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
      
      // Se temos usuário, marcar layout como pronto (mesmo se ainda não tivermos perfil)
      // Isso evitará tela em branco enquanto espera perfil
      setLayoutReady(true);
      
      // Verificar papel do usuário e rota atual
      if (user && profile) {
        const isLearningRoute = location.pathname.startsWith('/learning');
        const isPathAdmin = location.pathname.startsWith('/admin');
        const isPathFormacao = location.pathname.startsWith('/formacao');
        
        // Redirecionar apenas se estiver na rota errada
        if (isAdmin && !isPathAdmin && !isPathFormacao && !isLearningRoute) {
          navigate('/admin', { replace: true });
        } 
        else if (isFormacao && !isAdmin && !isPathFormacao && !isLearningRoute) {
          navigate('/formacao', { replace: true });
        }
      }
    } else {
      // Configurar timeout para não ficar preso em carregamento infinito
      timeoutRef.current = window.setTimeout(() => {
        setLayoutReady(true);
      }, 2000); // 2 segundos de timeout
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user, profile, isAdmin, isFormacao, isLoading, navigate, location.pathname]);

  // Verificar se estamos em páginas de formação
  const isFormacaoRoute = location.pathname.startsWith('/formacao');
  const isLearningRoute = location.pathname.startsWith('/learning');

  // Se o layout está pronto, renderizar com base na rota
  if (layoutReady && user) {
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
      <LoadingScreen message={
        isLoading ? "Preparando seu dashboard..." : 
        !user ? "Verificando autenticação..." : 
        "Carregando layout..."
      } />
    </PageTransitionWithFallback>
  );
};

export default LayoutProvider;
