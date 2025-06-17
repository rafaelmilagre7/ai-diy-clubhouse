
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { getUserRoleName } from "@/lib/supabase/types";

const RootRedirect = () => {
  const location = useLocation();
  const { user, profile, isLoading } = useAuth();
  
  console.log("[ROOT-REDIRECT] Estado atual:", {
    currentPath: location.pathname,
    hasUser: !!user,
    hasProfile: !!profile,
    isLoading,
    userEmail: user?.email
  });
  
  // Mostrar loading apenas enquanto verifica autenticação
  if (isLoading) {
    console.log("[ROOT-REDIRECT] Aguardando verificação de autenticação...");
    return <LoadingScreen message="Verificando autenticação..." />;
  }
  
  // Se não há usuário, ir para login
  if (!user) {
    console.log("[ROOT-REDIRECT] Usuário não autenticado - redirecionando para login");
    return <Navigate to="/login" replace />;
  }
  
  // Se há usuário mas não há perfil, ainda redirecionar para dashboard
  // O sistema pode funcionar sem perfil carregado
  const roleName = getUserRoleName(profile);
  
  // Se é formação, ir para área de formação
  if (roleName === 'formacao') {
    console.log("[ROOT-REDIRECT] Usuário formação - redirecionando para /formacao");
    return <Navigate to="/formacao" replace />;
  }
  
  // Caso padrão - dashboard para todos os outros usuários
  console.log("[ROOT-REDIRECT] Redirecionando para dashboard");
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
