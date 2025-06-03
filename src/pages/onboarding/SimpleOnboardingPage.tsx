
import React from 'react';
import { SimpleOnboardingFlow } from '@/components/onboarding/modern/SimpleOnboardingFlow';
import { useNavigate } from 'react-router-dom';
import { OnboardingCompletionGuard } from '@/components/onboarding/OnboardingCompletionGuard';

export const SimpleOnboardingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/dashboard');
  };

  return (
    <OnboardingCompletionGuard>
      <SimpleOnboardingFlow onComplete={handleComplete} />
    </OnboardingCompletionGuard>
  );
};

export default SimpleOnboardingPage;
