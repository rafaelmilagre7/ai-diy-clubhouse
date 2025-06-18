
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { getUserRoleName } from "@/lib/supabase/types";

const RootRedirect = () => {
  const { user, profile, isLoading, isAdmin } = useAuth();
  
  console.log("[ROOT-REDIRECT] Estado:", {
    hasUser: !!user,
    hasProfile: !!profile,
    isLoading,
    isAdmin,
    userEmail: user?.email
  });
  
  if (isLoading) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }
  
  if (!user) {
    console.log("[ROOT-REDIRECT] Redirecionando para login");
    return <Navigate to="/login" replace />;
  }
  
  // Admin sempre vai para dashboard
  if (isAdmin) {
    console.log("[ROOT-REDIRECT] Admin -> dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  
  // Formação vai para área de formação
  const roleName = getUserRoleName(profile);
  if (roleName === 'formacao') {
    console.log("[ROOT-REDIRECT] Formação -> /formacao");
    return <Navigate to="/formacao" replace />;
  }
  
  // Padrão -> dashboard
  console.log("[ROOT-REDIRECT] Padrão -> dashboard");
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
