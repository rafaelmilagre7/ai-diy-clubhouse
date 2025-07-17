import React from 'react';
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';
import LoadingScreen from '@/components/common/LoadingScreen';
import { SimpleOnboardingWizardNew } from '@/components/onboarding/SimpleOnboardingWizardNew';

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

  // Verificar se é usuário novo (apenas usuários novos fazem onboarding)
  const isNewUser = profile.created_at && new Date(profile.created_at) > new Date('2025-07-16');
  
  // Usuário legacy ou que já completou - redirecionar para dashboard
  if (!isNewUser || profile.onboarding_completed) {
    const roleName = profile.user_roles?.name;
    return <Navigate to={roleName === 'formacao' ? '/formacao' : '/dashboard'} replace />;
  }

  // Tudo ok - renderizar onboarding para usuário novo
  return <SimpleOnboardingWizardNew />;
};

export default OnboardingNewPage;