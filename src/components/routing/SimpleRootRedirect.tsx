
import { Navigate } from "react-router-dom";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";

const SimpleRootRedirect = () => {
  const { user, profile, isLoading, isAdmin } = useSimpleAuth();
  
  // Mostrar loading apenas enquanto verifica auth inicial
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }
  
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
