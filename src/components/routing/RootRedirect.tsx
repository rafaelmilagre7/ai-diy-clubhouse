
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { getUserRoleName } from "@/lib/supabase/types";

const RootRedirect = () => {
  const location = useLocation();
  const { user, profile, isLoading, isAdmin } = useAuth();
  
  console.log("[ROOT-REDIRECT] Estado atual:", {
    currentPath: location.pathname,
    hasUser: !!user,
    hasProfile: !!profile,
    isLoading,
    isAdmin,
    userEmail: user?.email
  });
  
  // Mostrar loading apenas se realmente necessário
  if (isLoading) {
    console.log("[ROOT-REDIRECT] Aguardando autenticação...");
    return <LoadingScreen message="Verificando autenticação..." />;
  }
  
  // Se não há usuário, ir para login
  if (!user) {
    console.log("[ROOT-REDIRECT] Usuário não autenticado - redirecionando para login");
    return <Navigate to="/login" replace />;
  }
  
  // Se há usuário, decidir redirecionamento
  const roleName = getUserRoleName(profile);
  
  // Admin por email sempre vai para dashboard (mesmo sem perfil carregado)
  if (isAdmin) {
    console.log("[ROOT-REDIRECT] Admin detectado - redirecionando para dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  
  // Se é formação, ir para área de formação
  if (roleName === 'formacao') {
    console.log("[ROOT-REDIRECT] Usuário formação - redirecionando para /formacao");
    return <Navigate to="/formacao" replace />;
  }
  
  // Caso padrão - dashboard
  console.log("[ROOT-REDIRECT] Redirecionando para dashboard");
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
