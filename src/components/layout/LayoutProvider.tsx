
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, ReactNode } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import MemberLayout from "./MemberLayout";
import FormacaoLayout from "./formacao/FormacaoLayout";
import { toast } from "sonner";

/**
 * LayoutProvider handles authentication checks and role-based routing
 * before rendering the appropriate layout component
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
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  
  // Debug logs
  console.log("LayoutProvider state:", { user, profile, isAdmin, isFormacao, isLoading, loadingTimeout });

  // Configurar timeout de carregamento
  useEffect(() => {
    if (isLoading && !loadingTimeout) {
      // Limpar qualquer timeout existente
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        console.log("LayoutProvider: Loading timeout exceeded, redirecting to login");
        setLoadingTimeout(true);
        toast.error("Tempo limite de carregamento excedido, redirecionando para login");
        navigate('/login', { replace: true });
      }, 8000); // 8 segundos
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, loadingTimeout, navigate]);

  // Verificar autenticação
  useEffect(() => {
    if (!isLoading && !user) {
      console.log("LayoutProvider: No authenticated user, redirecting to login");
      navigate('/login', { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Verificar papel do usuário
  useEffect(() => {
    if (!isLoading && user && profile) {
      if (isAdmin && window.location.pathname.indexOf('/admin') !== 0 && window.location.pathname.indexOf('/formacao') !== 0) {
        console.log("LayoutProvider: Admin user detected, redirecting to admin area");
        navigate('/admin', { replace: true });
      } else if (isFormacao && !isAdmin && window.location.pathname.indexOf('/formacao') !== 0) {
        console.log("LayoutProvider: Formacao user detected, redirecting to formacao area");
        navigate('/formacao', { replace: true });
      }
    }
  }, [user, profile, isAdmin, isFormacao, isLoading, navigate]);

  // Verificar se estamos em páginas de formação
  const isFormacaoRoute = window.location.pathname.indexOf('/formacao') === 0;

  // Fast path for members - If we have user and profile, render immediately
  if (user && profile) {
    if (isFormacaoRoute && (isFormacao || isAdmin)) {
      console.log("LayoutProvider: Renderizando FormacaoLayout");
      return <FormacaoLayout>{children}</FormacaoLayout>;
    } else if (!isFormacao || isAdmin) {
      console.log("LayoutProvider: Renderizando MemberLayout");
      return <MemberLayout>{children}</MemberLayout>;
    }
  }

  // Show loading screen while checking the session (but only if timeout not exceeded)
  if ((isLoading || !profile) && !loadingTimeout) {
    return <LoadingScreen message="Preparando seu dashboard..." />;
  }

  // Se não tiver usuário após carregamento, redirecionar para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se for admin, redirecionar para área admin
  if (isAdmin && !isFormacaoRoute) {
    return <Navigate to="/admin" replace />;
  }

  // Se for formacao (sem ser admin), redirecionar para área formacao
  if (isFormacao && !isAdmin && !isFormacaoRoute) {
    return <Navigate to="/formacao" replace />;
  }

  // Default case: Render the member layout
  return <MemberLayout>{children}</MemberLayout>;
};

export default LayoutProvider;
