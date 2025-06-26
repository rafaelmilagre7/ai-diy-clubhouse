
import { Navigate } from "react-router-dom";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";

const SimpleRootRedirect = () => {
  const { user, profile, isAdmin } = useSimpleAuth();
  
  console.log("[SIMPLE-ROOT-REDIRECT] Estado:", {
    hasUser: !!user,
    hasProfile: !!profile,
    isAdmin,
    userRole: profile?.user_roles?.name
  });
  
  // SEM USUÁRIO = LOGIN DIRETO (SEM LOADING)
  if (!user) {
    console.log("[SIMPLE-ROOT-REDIRECT] Sem usuário -> /login");
    return <Navigate to="/login" replace />;
  }
  
  // ADMIN = ADMIN DASHBOARD
  if (isAdmin) {
    console.log("[SIMPLE-ROOT-REDIRECT] Admin -> /admin");
    return <Navigate to="/admin" replace />;
  }
  
  // FORMAÇÃO = ÁREA DE FORMAÇÃO
  if (profile?.user_roles?.name === 'formacao') {
    console.log("[SIMPLE-ROOT-REDIRECT] Formação -> /formacao");
    return <Navigate to="/formacao" replace />;
  }
  
  // PADRÃO = DASHBOARD DO MEMBRO
  console.log("[SIMPLE-ROOT-REDIRECT] Membro -> /dashboard");
  return <Navigate to="/dashboard" replace />;
};

export default SimpleRootRedirect;
