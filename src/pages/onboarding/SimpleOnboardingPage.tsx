
import React from 'react';
import { SimpleOnboardingFlow } from '@/components/onboarding/modern/SimpleOnboardingFlow';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const SimpleOnboardingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    console.log('✅ Onboarding completo, redirecionando...');
    toast.success('Bem-vindo ao VIVER DE IA Club! 🎉');
    navigate('/onboarding-new/completed');
  };

  return <SimpleOnboardingFlow onComplete={handleComplete} />;
};

export default SimpleOnboardingPage;
