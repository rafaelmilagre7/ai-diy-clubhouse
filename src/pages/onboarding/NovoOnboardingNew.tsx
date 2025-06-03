
import React from 'react';
import { SimpleOnboardingFlow } from '@/components/onboarding/modern/SimpleOnboardingFlow';
import { useNavigate } from 'react-router-dom';

const NovoOnboardingNew = () => {
  const navigate = useNavigate();
  
  const handleComplete = () => {
    navigate('/dashboard');
  };

  return <SimpleOnboardingFlow onComplete={handleComplete} />;
};

export default NovoOnboardingNew;
