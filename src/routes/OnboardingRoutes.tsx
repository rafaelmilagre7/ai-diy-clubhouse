
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NovoOnboardingNew from '@/pages/onboarding/NovoOnboardingNew';
import OnboardingCompletedNew from '@/components/onboarding/OnboardingCompletedNew';

export const OnboardingRoutes = () => {
  return (
    <Routes>
      <Route index element={<NovoOnboardingNew />} />
      <Route path="completed" element={<OnboardingCompletedNew />} />
      <Route path="*" element={<Navigate to="/onboarding-new" replace />} />
    </Routes>
  );
};
