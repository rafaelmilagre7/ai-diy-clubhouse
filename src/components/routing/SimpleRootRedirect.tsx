
import { Navigate } from "react-router-dom";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";

const SimpleRootRedirect = () => {
  const { user, profile, isLoading, isAdmin } = useSimpleAuth();
  
  // Loading simples - máximo 2 segundos
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
  
  // Sem usuário = login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Admin vai direto para admin
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  
  // Formação vai para área específica
  if (profile?.user_roles?.name === 'formacao') {
    return <Navigate to="/formacao" replace />;
  }
  
  // Padrão = dashboard
  return <Navigate to="/dashboard" replace />;
};

export default SimpleRootRedirect;
