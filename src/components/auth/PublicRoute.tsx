
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
  
  // Se não estiver autenticado ou ainda está carregando, permite o acesso à rota pública
  return <>{children}</>;
};

export default PublicRoute;
