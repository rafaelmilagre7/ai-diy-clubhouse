
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";

const RootRedirect = () => {
  const { user, isAdmin, isLoading } = useAuth();
  
  // Mostrar loading screen enquanto verifica autenticação
  if (isLoading) {
    return <LoadingScreen message="Preparando sua experiência..." />;
  }
  
  // Se não houver usuário, redirecionar para login
  if (!user) {
    console.log("RootRedirect: Não há usuário autenticado, redirecionando para login");
    return <Navigate to="/login" replace />;
  }
  
  // Se for admin, redirecionar para área admin
  if (isAdmin) {
    console.log("RootRedirect: Usuário é admin, redirecionando para /admin");
    return <Navigate to="/admin" replace />;
  }
  
  // Para usuários autenticados, redirecionar para o dashboard
  console.log("RootRedirect: Usuário normal autenticado, redirecionando para /dashboard");
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
