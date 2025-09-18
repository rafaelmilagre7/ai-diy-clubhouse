
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requiredRole?: string;
}

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  requiredRole
}: ProtectedRouteProps) => {
  // Usar useAuth de forma defensiva
  let user, profile, isAdmin, isLoading;
  try {
    const authContext = useAuth();
    user = authContext?.user;
    profile = authContext?.profile;
    isAdmin = authContext?.isAdmin;
    isLoading = authContext?.isLoading;
  } catch (error) {
    console.log('🛡️ [PROTECTED-ROUTE] AuthProvider não disponível ainda, mostrando loading');
    return <LoadingScreen message="Inicializando autenticação..." />;
  }
  
  const location = useLocation();
  
  // Se estiver carregando, mostra tela de loading
  if (isLoading) {
    return <LoadingScreen message="Verificando sua autenticação..." />;
  }

  // Se não houver usuário autenticado, redireciona para login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se não há perfil mas há usuário, aguarda um pouco mais
  if (user && !profile) {
    console.log("[PROTECTED-ROUTE] Aguardando criação do perfil...");
    return <LoadingScreen message="Configurando sua conta..." />;
  }
  
  // Verificar se requer admin e usuário não é admin
  if ((requiredRole === 'admin' || requireAdmin) && !isAdmin) {
    toast.error("Você não tem permissão para acessar esta área");
    return <Navigate to="/dashboard" replace />;
  }

  // Usuário está autenticado e tem permissões necessárias
  return <>{children}</>;
};

export default ProtectedRoute;
