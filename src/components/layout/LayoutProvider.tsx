
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, ReactNode } from "react";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import MemberLayout from "./MemberLayout";
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
    isLoading,
  } = useAuth();
  const navigate = useNavigate();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  
  // Debug logs para ajudar a entender o fluxo
  console.log("LayoutProvider state:", { user, profile, isAdmin, isLoading, loadingTimeout });

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
      }, 5000); // Aumentar para 5 segundos para dar mais tempo
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
      if (isAdmin && window.location.pathname.indexOf('/admin') !== 0) {
        console.log("LayoutProvider: Admin user detected, redirecting to admin area");
        navigate('/admin', { replace: true });
      }
    }
  }, [user, profile, isAdmin, isLoading, navigate]);

  // Fast path for members - If we have user and profile, render immediately
  if (user && profile && !isAdmin) {
    return <MemberLayout>{children}</MemberLayout>;
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
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Default case: Render the member layout
  return <MemberLayout>{children}</MemberLayout>;
};

export default LayoutProvider;
