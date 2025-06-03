
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requiredRole?: string;
  requireOnboarding?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  requiredRole,
  requireOnboarding = false
}: ProtectedRouteProps) => {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();
  
  console.log('ProtectedRoute: Checking auth', { user: !!user, profile: !!profile, isLoading });
  
  // Se estiver carregando, mostra tela de loading por tempo limitado
  if (isLoading) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  // Se não houver usuário autenticado, redireciona para login
  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Verificar permissões de admin
  if ((requiredRole === 'admin' || requireAdmin) && profile?.role !== 'admin') {
    console.log('ProtectedRoute: Admin required but user is not admin');
    return <Navigate to="/dashboard" replace />;
  }
  
  // Verificar permissões de formação
  if (requiredRole === 'formacao' && profile?.role !== 'formacao' && profile?.role !== 'admin') {
    console.log('ProtectedRoute: Formacao required but user does not have permission');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('ProtectedRoute: Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;
