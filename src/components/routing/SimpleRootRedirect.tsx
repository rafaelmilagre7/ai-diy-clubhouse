
import { Navigate } from "react-router-dom";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";

const SimpleRootRedirect = () => {
  const { user, profile, isAdmin } = useSimpleAuth();
  
  // SEM verificação de loading - ser direto
  
  // Sem usuário = login direto
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Admin = admin dashboard
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  
  // Formação = área de formação
  if (profile?.user_roles?.name === 'formacao') {
    return <Navigate to="/formacao" replace />;
  }
  
  // Padrão = dashboard do membro
  return <Navigate to="/dashboard" replace />;
};

export default SimpleRootRedirect;
