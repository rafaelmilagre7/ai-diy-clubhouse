
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";

/**
 * RootRedirect - Redireciona o usuário de acordo com seu tipo
 * Usado na rota raiz para determinar para onde o usuário deve ir
 */
const RootRedirect = () => {
  const { user, isAdmin, isLoading } = useAuth();
  
  // Debug log
  console.log("RootRedirect:", { user: !!user, isAdmin, isLoading });
  
  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return <LoadingScreen message="Preparando sua experiência..." />;
  }
  
  // Se não houver usuário, redirecionar para login
  if (!user) {
    console.log("RootRedirect: Redirecionando para login");
    return <Navigate to="/login" replace />;
  }
  
  // Se for admin, redirecionar para área admin
  if (isAdmin) {
    console.log("RootRedirect: Redirecionando para admin");
    return <Navigate to="/admin" replace />;
  }
  
  // Para usuários autenticados, redirecionar para o dashboard
  console.log("RootRedirect: Redirecionando para dashboard");
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
