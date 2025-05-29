
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import NovoOnboardingNew from '@/pages/onboarding/NovoOnboardingNew';
import OnboardingCompletedNewPage from '@/pages/onboarding/OnboardingCompletedNew';

export const OnboardingRoutes = () => {
  return (
    <Routes>
      {/* Rota principal do onboarding moderno */}
      <Route 
        index 
        element={<NovoOnboardingNew />} 
      />
      
      {/* Rota para a página de sucesso */}
      <Route 
        path="completed" 
        element={<OnboardingCompletedNewPage />} 
      />
      
      {/* Redirect de rotas antigas */}
      <Route 
        path="*" 
        element={<Navigate to="/onboarding-new" replace />} 
      />
    </Routes>
  );
};
