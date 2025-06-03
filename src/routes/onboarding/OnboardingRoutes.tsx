
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingGuard } from '../guards/OnboardingGuard';
import { lazy, Suspense } from 'react';
import LoadingScreen from '@/components/common/LoadingScreen';

// Lazy loading das páginas de onboarding
const OnboardingFlow = lazy(() => import('@/pages/onboarding/NovoOnboardingNew'));
const OnboardingCompleted = lazy(() => import('@/components/onboarding/OnboardingCompletedNew'));

export const OnboardingRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route 
          index 
          element={
            <OnboardingGuard requireCompleted={false} redirectTo="/dashboard">
              <OnboardingFlow />
            </OnboardingGuard>
          } 
        />
        <Route 
          path="completed" 
          element={
            <OnboardingGuard requireCompleted={true} redirectTo="/onboarding-new">
              <OnboardingCompleted />
            </OnboardingGuard>
          } 
        />
        <Route path="*" element={<Navigate to="/onboarding-new" replace />} />
      </Routes>
    </Suspense>
  );
};
