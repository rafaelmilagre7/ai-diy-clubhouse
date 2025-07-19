
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { getUserRoleName } from "@/lib/supabase/types";

const RootRedirect = () => {
  const location = useLocation();
  const { user, profile, isLoading } = useAuth();
  
  console.log("🔍 [ROOT-REDIRECT] Estado:", {
    path: location.pathname,
    hasUser: !!user,
    hasProfile: !!profile,
    isLoading
  });

  // Ainda carregando
  if (isLoading) {
    return <LoadingScreen message="Verificando sessão" showProgress />;
  }

  // Sem usuário = login
  if (!user) {
    console.log("🔄 [ROOT-REDIRECT] Sem usuário - redirecionando para login");
    return <Navigate to="/login" replace />;
  }

  // Usuário logado tentando acessar login
  if (location.pathname === '/login') {
    const targetRoute = profile && getUserRoleName(profile) === 'formacao' 
      ? '/formacao' 
      : '/dashboard';
    console.log("✅ [ROOT-REDIRECT] Usuário logado - redirecionando para", targetRoute);
    return <Navigate to={targetRoute} replace />;
  }

  // Redirecionamento padrão para root
  if (location.pathname === '/') {
    const targetRoute = profile && getUserRoleName(profile) === 'formacao' 
      ? '/formacao' 
      : '/dashboard';
    console.log("🔄 [ROOT-REDIRECT] Root redirect para", targetRoute);
    return <Navigate to={targetRoute} replace />;
  }

  // Página não encontrada ou outras situações
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
