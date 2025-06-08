
import React from 'react';
import { Navigate } from 'react-router-dom';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';

export const OnboardingPage: React.FC = () => {
  const { user } = useAuth();
  
  // Verificar se usuário já completou onboarding
  const { data: hasCompletedOnboarding, isLoading } = useQuery({
    queryKey: ['onboarding-status', user?.id],
    queryFn: async () => {
      // Mock por enquanto - depois integrar com Supabase
      const saved = localStorage.getItem('viver_onboarding_completed');
      return saved === 'true';
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirecionar se já completou
  if (hasCompletedOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleComplete = () => {
    localStorage.setItem('viver_onboarding_completed', 'true');
    window.location.href = '/dashboard';
  };

  return (
    <OnboardingFlow 
      type="club" 
      onComplete={handleComplete}
    />
  );
};
