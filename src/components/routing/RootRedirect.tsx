
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

  // Ainda carregando - mostrar loading apenas por tempo limitado
  if (isLoading) {
    return <LoadingScreen message="Verificando sessão" showProgress />;
  }

  // Sem usuário = login
  if (!user) {
    console.log("🔄 [ROOT-REDIRECT] Sem usuário - redirecionando para login");
    return <Navigate to="/login" replace />;
  }

  // Usuário logado mas ainda sem perfil - aguardar um pouco mais
  if (user && !profile) {
    console.log("⏳ [ROOT-REDIRECT] Aguardando perfil...");
    return <LoadingScreen message="Carregando seu perfil..." />;
  }

  // Usuário logado tentando acessar login
  if (location.pathname === '/login' && user && profile) {
    const targetRoute = getUserRoleName(profile) === 'formacao' 
      ? '/formacao' 
      : '/dashboard';
    console.log("✅ [ROOT-REDIRECT] Usuário logado - redirecionando para", targetRoute);
    return <Navigate to={targetRoute} replace />;
  }

  // Redirecionamento padrão para root
  if (location.pathname === '/' && user && profile) {
    const targetRoute = getUserRoleName(profile) === 'formacao' 
      ? '/formacao' 
      : '/dashboard';
    console.log("🔄 [ROOT-REDIRECT] Root redirect para", targetRoute);
    return <Navigate to={targetRoute} replace />;
  }

  // Fallback para dashboard
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
