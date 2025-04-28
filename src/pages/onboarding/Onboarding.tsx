
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingSteps } from '@/components/onboarding/OnboardingSteps';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { EtapasProgresso } from '@/components/onboarding/EtapasProgresso';
import { useOnboardingSteps } from '@/hooks/onboarding/useOnboardingSteps';
import { useProgress } from '@/hooks/onboarding/useProgress';
import MemberLayout from '@/components/layout/MemberLayout';
import OnboardingIntro from './OnboardingIntro';

const Onboarding: React.FC = () => {
  const { currentStepIndex, steps, navigateToStep, saveStepData } = useOnboardingSteps();
  const { progress } = useProgress();

  // Se o usuário acessar /onboarding diretamente, redireciona para a página inicial
  if (window.location.pathname === '/onboarding') {
    return <Navigate to="/onboarding/steps" replace />;
  }

  return (
    <MemberLayout>
      <div className="container max-w-screen-lg mx-auto py-8">
        <OnboardingHeader isOnboardingCompleted={false} />
        <div className="mt-6">
          <EtapasProgresso
            currentStep={currentStepIndex + 1}
            totalSteps={steps.length}
            onStepClick={navigateToStep}
          />
        </div>
        <div className="mt-8">
          <Routes>
            <Route path="/steps/*" element={<OnboardingSteps />} />
          </Routes>
        </div>
      </div>
    </MemberLayout>
  );
};

export default Onboarding;
