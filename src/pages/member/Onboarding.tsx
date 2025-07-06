import React from 'react';
import { useAuth } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';
import LoadingScreen from '@/components/common/LoadingScreen';
import { RealOnboardingWizard } from '@/components/onboarding/RealOnboardingWizard';

const OnboardingPage = () => {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Carregando seus dados..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se já completou onboarding, vai para dashboard
  if (profile?.onboarding_completed) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <RealOnboardingWizard />
    </div>
  );
};

export default OnboardingPage;