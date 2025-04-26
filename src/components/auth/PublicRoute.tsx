
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  // Se o usuário estiver autenticado, redireciona para o dashboard
  if (!isLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Renderização otimista - mostra o conteúdo enquanto verifica a autenticação
  return <>{children}</>;
};

export default PublicRoute;
