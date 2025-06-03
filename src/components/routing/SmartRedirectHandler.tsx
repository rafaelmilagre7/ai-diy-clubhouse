
import React from 'react';
import { useAuth } from '@/contexts/auth';
import LoadingScreen from '@/components/common/LoadingScreen';

interface SmartRedirectHandlerProps {
  children: React.ReactNode;
}

export const SmartRedirectHandler: React.FC<SmartRedirectHandlerProps> = ({ children }) => {
  const { isLoading: authLoading } = useAuth();

  // Mostrar loading apenas durante autenticação
  if (authLoading) {
    return <LoadingScreen message="Verificando autenticação..." />;
  }

  // REMOVIDO: Toda lógica de redirecionamento automático que causava loops
  // Agora apenas passa os children sem interferir na navegação
  return <>{children}</>;
};
