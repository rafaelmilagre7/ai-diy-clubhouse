
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/hooks/use-toast";
import LoadingScreen from "@/components/common/LoadingScreen";
import MemberLayout from "./MemberLayout";

/**
 * LayoutProvider handles authentication checks and role-based routing
 * before rendering the appropriate layout component
 */
const LayoutProvider = () => {
  const { user, profile, isAdmin, isLoading, setIsLoading } = useAuth();
  const navigate = useNavigate();
  const [redirectChecked, setRedirectChecked] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Verificar se o carregamento está demorando muito 
  useEffect(() => {
    if (isLoading) {
      const timeoutId = setTimeout(() => {
        setLoadingTimeout(true);
      }, 1000); // Reduzido para 1 segundo
      
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading]);
  
  // Se o timeout for atingido, redirecionar para auth
  useEffect(() => {
    if (loadingTimeout && isLoading) {
      console.log("LayoutProvider: Tempo limite de carregamento excedido, redirecionando para /auth");
      setIsLoading(false);
      navigate('/auth', { replace: true });
    }
  }, [loadingTimeout, isLoading, navigate, setIsLoading]);

  // Check user role only once when profile is loaded
  useEffect(() => {
    if (!profile || redirectChecked) {
      return;
    }
    
    if (profile.role === 'admin') {
      console.log("LayoutProvider: Usuário é admin, redirecionando para /admin");
      
      toast({
        title: "Redirecionando para área de administração",
        description: "Você está sendo redirecionado para a área de admin porque tem permissões de administrador."
      });
      
      navigate('/admin', { replace: true });
    }
    
    setRedirectChecked(true);
  }, [profile, navigate, redirectChecked, toast]);

  // Fast pass - se temos usuário e o perfil, não mostrar loading
  if (user && profile && !isAdmin) {
    return <MemberLayout />;
  }

  // Show loading screen while checking the session (mas apenas se não excedeu o timeout)
  if (isLoading && !loadingTimeout) {
    return <LoadingScreen />;
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user is admin, redirect to admin layout
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Render the member layout
  return <MemberLayout />;
};

export default LayoutProvider;
