import React from 'react';
import { useAuth } from '@/contexts/auth';
import { Navigate, Link } from 'react-router-dom';
import LoadingScreen from '@/components/common/LoadingScreen';
import { SimpleOnboardingWizard } from '@/components/onboarding/SimpleOnboardingWizard';
import OnboardingRedirectWrapper from '@/components/onboarding/OnboardingRedirectWrapper';

const OnboardingPage = () => {
  return (
    <OnboardingRedirectWrapper>
      <SimpleOnboardingWizard />
    </OnboardingRedirectWrapper>
  );
};

export default OnboardingPage;