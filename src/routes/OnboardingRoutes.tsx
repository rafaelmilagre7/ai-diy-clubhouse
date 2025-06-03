
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NovoOnboardingNew from '@/pages/onboarding/NovoOnboardingNew';
import { OnboardingCompletedNew } from '@/components/onboarding/OnboardingCompletedNew';

export const OnboardingRoutes = () => {
  return (
    <Routes>
      {/* Rota principal do onboarding */}
      <Route index element={<NovoOnboardingNew />} />
      
      {/* Página de conclusão */}
      <Route path="completed" element={<OnboardingCompletedNew />} />
      
      {/* Redirect de rotas antigas para o novo sistema */}
      <Route path="final" element={<Navigate to="/onboarding-new" replace />} />
      <Route path="final/*" element={<Navigate to="/onboarding-new" replace />} />
      
      {/* Catch-all para outras rotas */}
      <Route path="*" element={<Navigate to="/onboarding-new" replace />} />
    </Routes>
  );
};
