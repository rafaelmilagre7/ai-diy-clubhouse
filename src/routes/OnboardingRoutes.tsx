
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MemberLayout from '@/components/layout/MemberLayout';

export const OnboardingRoutes = () => {
  return (
    <Routes>
      <Route index element={
        <MemberLayout>
          <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Onboarding</h1>
            <p>Sistema de onboarding em desenvolvimento.</p>
          </div>
        </MemberLayout>
      } />
    </Routes>
  );
};
