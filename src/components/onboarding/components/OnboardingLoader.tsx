
import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import LoadingScreen from '@/components/common/LoadingScreen';

interface OnboardingLoaderProps {
  children: React.ReactNode;
}

export const OnboardingLoader = ({ children }: OnboardingLoaderProps) => {
  console.log('[OnboardingLoader] Componente renderizado');
  
  // TODOS OS HOOKS DEVEM SER EXECUTADOS SEMPRE
  const { user, profile, isLoading: authLoading } = useAuth();
  const { isRequired, isLoading: onboardingLoading, canProceed } = useOnboardingStatus();
  const navigate = useNavigate();
  const [hasChecked, setHasChecked] = useState(false);

  // Determinar tipo de membro sempre após todos os hooks
  const memberType = profile?.role === 'formacao' ? 'formacao' : 'club';

  console.log('[OnboardingLoader] Estado atual:', {
    authLoading,
    onboardingLoading,
    canProceed,
    user: !!user,
    profile: !!profile,
    isRequired,
    hasChecked,
    memberType
  });

  // Lógica de redirecionamento - sempre após todos os hooks
  useEffect(() => {
    console.log('[OnboardingLoader] useEffect - verificando condições para redirecionamento');
    
    if (!authLoading && !onboardingLoading && canProceed && !hasChecked) {
      setHasChecked(true);
      
      console.log('[OnboardingLoader] Condições atendidas, verificando redirecionamentos');
      
      // Se usuário não está autenticado
      if (!user) {
        console.log('[OnboardingLoader] Usuário não autenticado, redirecionando para login');
        navigate('/login', { replace: true });
        return;
      }

      // Se onboarding não é necessário
      if (isRequired === false) {
        console.log('[OnboardingLoader] Onboarding não necessário, redirecionando para dashboard');
        const redirectPath = memberType === 'formacao' ? '/formacao' : '/dashboard';
        navigate(redirectPath, { replace: true });
        return;
      }

      console.log('[OnboardingLoader] Onboarding necessário, mantendo na página');
    }
  }, [authLoading, onboardingLoading, canProceed, hasChecked, user, isRequired, memberType, navigate]);

  // Mostrar loading enquanto verifica - sempre após todos os hooks e useEffect
  if (authLoading || onboardingLoading || !canProceed || !hasChecked) {
    console.log('[OnboardingLoader] Mostrando loading');
    return (
      <LoadingScreen message="Verificando seu progresso..." />
    );
  }

  // Se não está autenticado
  if (!user) {
    console.log('[OnboardingLoader] Redirecionamento por Navigate - login');
    return <Navigate to="/login" replace />;
  }

  // Se onboarding não é necessário
  if (isRequired === false) {
    console.log('[OnboardingLoader] Redirecionamento por Navigate - dashboard');
    const redirectPath = memberType === 'formacao' ? '/formacao' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // Se onboarding é necessário, renderizar children (OnboardingWizard)
  console.log('[OnboardingLoader] Renderizando onboarding wizard');
  return <>{children}</>;
};
