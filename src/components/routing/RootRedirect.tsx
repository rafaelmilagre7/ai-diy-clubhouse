
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";

const RootRedirect = () => {
  const { user, profile, isLoading, isAdmin } = useAuth();
  
  console.log("[ROOT-REDIRECT] Estado:", {
    hasUser: !!user,
    hasProfile: !!profile,
    isLoading,
    isAdmin,
    userEmail: user?.email
  });
  
  // Aguardar o carregamento completo
  if (isLoading) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }
  
  // Se não há usuário, ir para login
  if (!user) {
    console.log("[ROOT-REDIRECT] Sem usuário -> login");
    return <Navigate to="/login" replace />;
  }
  
  // Se há usuário mas ainda não carregou perfil, aguardar um pouco mais
  if (user && !profile) {
    console.log("[ROOT-REDIRECT] Usuário sem perfil, aguardando...");
    return <LoadingScreen message="Carregando perfil..." />;
  }
  
  // Admin sempre vai para dashboard
  if (isAdmin) {
    console.log("[ROOT-REDIRECT] Admin -> dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  
  // Usuários de formação
  if (profile?.user_roles?.name === 'formacao') {
    console.log("[ROOT-REDIRECT] Formação -> /formacao");
    return <Navigate to="/formacao" replace />;
  }
  
  // Padrão -> dashboard
  console.log("[ROOT-REDIRECT] Usuário padrão -> dashboard");
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
