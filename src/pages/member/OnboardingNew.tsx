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

  // 🎯 PERMITIR ONBOARDING SEMPRE (usuário pode querer refazer)
  const registroRecente = sessionStorage.getItem('registro_recente') === 'true';
  const isNewUser = profile.created_at && new Date(profile.created_at) > new Date('2025-07-16');
  
  console.log('[ONBOARDING] Verificando acesso', {
    userId: user.id,
    registroRecente,
    isNewUser,
    onboardingCompleted: profile.onboarding_completed,
    profileCreated: profile.created_at
  });
  
  // ✅ PERMITIR ACESSO SEMPRE - usuário pode querer rever onboarding
  // Apenas mostrar aviso se já completou e não é registro recente

  // Tudo ok - renderizar onboarding para usuário novo
  return <SimpleOnboardingWizard />;
};

export default OnboardingNewPage;