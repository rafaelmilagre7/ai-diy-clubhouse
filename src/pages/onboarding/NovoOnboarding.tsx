
import React from 'react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { PersonalInfoFormFull } from '@/components/onboarding/steps/PersonalInfoFormFull';

const NovoOnboarding = () => {
  return (
    <OnboardingLayout 
      currentStep={1} 
      title="Dados Pessoais" 
      backUrl="/"
    >
      <PersonalInfoFormFull />
    </OnboardingLayout>
  );
};

export default NovoOnboarding;
