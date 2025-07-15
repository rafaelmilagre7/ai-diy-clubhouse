import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import LoadingScreen from '@/components/common/LoadingScreen';

/**
 * Wrapper simples e direto para redirecionamento de onboarding
 * Evita loops e garante navegação suave
 */
const OnboardingRedirectWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isLoading } = useAuth();

  // Se carregando, mostrar loading
  if (isLoading) {
    return <LoadingScreen message="Verificando seu progresso..." />;
  }

  // Se não há usuário, vai para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se não há perfil ainda, aguardar
  if (!profile) {
    return <LoadingScreen message="Carregando seu perfil..." />;
  }

  // Se onboarding completo e está na página de onboarding, redirecionar
  if (profile.onboarding_completed && window.location.pathname.startsWith('/onboarding')) {
    const roleName = profile.user_roles?.name;
    return <Navigate to={roleName === 'formacao' ? '/formacao' : '/dashboard'} replace />;
  }

  return <>{children}</>;
};

export default OnboardingRedirectWrapper;