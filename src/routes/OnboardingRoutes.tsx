
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NovoOnboardingNew from '@/pages/onboarding/NovoOnboardingNew';
import OnboardingCompletedNewPage from '@/pages/onboarding/OnboardingCompletedNew';
import { OnboardingFinalFlow } from '@/components/onboarding/final/OnboardingFinalFlow';
import OnboardingFinalCompleted from '@/pages/onboarding/OnboardingFinalCompleted';

export const OnboardingRoutes = () => {
  return (
    <Routes>
      {/* Novo fluxo de onboarding final - salva apenas no final */}
      <Route 
        path="final" 
        element={<OnboardingFinalFlow />} 
      />
      
      <Route 
        path="final/completed" 
        element={<OnboardingFinalCompleted />} 
      />
      
      {/* Rota principal do onboarding antigo (mantido para compatibilidade) */}
      <Route 
        index 
        element={<NovoOnboardingNew />} 
      />
      
      {/* Rota para a página de sucesso antiga */}
      <Route 
        path="completed" 
        element={<OnboardingCompletedNewPage />} 
      />
      
      {/* Redirect de rotas antigas */}
      <Route 
        path="*" 
        element={<Navigate to="/onboarding-new/final" replace />} 
      />
    </Routes>
  );
};
