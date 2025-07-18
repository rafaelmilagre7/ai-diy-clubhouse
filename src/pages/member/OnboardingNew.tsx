import React from 'react';
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';
import LoadingScreen from '@/components/common/LoadingScreen';
import { SimpleOnboardingWizard } from '@/components/onboarding/SimpleOnboardingWizard';

const OnboardingNewPage = () => {
  const { user, profile, isLoading } = useAuth();

  // Loading
  if (isLoading) {
    return <LoadingScreen message="Verificando acesso..." />;
  }

  // Usuário não autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Usuário sem perfil (erro crítico)
  if (!profile) {
    console.error("Usuário sem perfil tentando acessar onboarding");
    return <Navigate to="/login" replace />;
  }

  // SIMPLIFICAÇÃO: Usar apenas profile.onboarding_completed
  if (profile.onboarding_completed) {
    const roleName = profile.user_roles?.name;
    return <Navigate to={roleName === 'formacao' ? '/formacao' : '/dashboard'} replace />;
  }

  // Tudo ok - renderizar onboarding para usuário novo
  return <SimpleOnboardingWizard />;
};

export default OnboardingNewPage;