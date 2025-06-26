
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
  
  // Sem usuário = login direto
  if (!user) {
    console.log("[SIMPLE-ROOT-REDIRECT] Sem usuário -> /login");
    return <Navigate to="/login" replace />;
  }
  
  // Admin = admin dashboard
  if (isAdmin) {
    console.log("[SIMPLE-ROOT-REDIRECT] Admin -> /admin");
    return <Navigate to="/admin" replace />;
  }
  
  // Formação = área de formação
  if (profile?.user_roles?.name === 'formacao') {
    console.log("[SIMPLE-ROOT-REDIRECT] Formação -> /formacao");
    return <Navigate to="/formacao" replace />;
  }
  
  // Padrão = dashboard do membro
  console.log("[SIMPLE-ROOT-REDIRECT] Membro -> /dashboard");
  return <Navigate to="/dashboard" replace />;
};

export default SimpleRootRedirect;
