
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import LoadingScreen from '@/components/common/LoadingScreen';
import { toast } from 'sonner';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
  requireOnboarding?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/dashboard',
  requireOnboarding = true
}) => {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen message="Verificando permissões..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!profile) {
    return <LoadingScreen message="Carregando perfil..." />;
  }

  // Verificar se o role do usuário está permitido
  if (!allowedRoles.includes(profile.role || 'member')) {
    toast.error('Você não tem permissão para acessar esta área');
    return <Navigate to={fallbackPath} replace />;
  }

  // Verificar onboarding se necessário
  if (requireOnboarding && !profile.onboarding_completed && profile.role !== 'admin') {
    if (!location.pathname.startsWith('/onboarding')) {
      return <Navigate to="/onboarding-new" replace />;
    }
  }

  return <>{children}</>;
};
