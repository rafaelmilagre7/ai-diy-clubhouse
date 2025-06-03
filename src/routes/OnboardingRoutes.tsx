
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingFinalFlow } from '@/components/onboarding/final/OnboardingFinalFlow';
import { OnboardingCompletionGuard } from '@/components/onboarding/OnboardingCompletionGuard';
import OnboardingFinalCompleted from '@/pages/onboarding/OnboardingFinalCompleted';

export const OnboardingRoutes = () => {
  return (
    <OnboardingCompletionGuard>
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
        
        {/* Redirecionar rota principal para o novo sistema */}
        <Route 
          index 
          element={<Navigate to="/onboarding-new/final" replace />} 
        />
        
        {/* Redirecionar página de sucesso antiga para a nova */}
        <Route 
          path="completed" 
          element={<Navigate to="/onboarding-new/final/completed" replace />} 
        />
        
        {/* Redirect de todas as outras rotas antigas para o novo sistema */}
        <Route 
          path="*" 
          element={<Navigate to="/onboarding-new/final" replace />} 
        />
      </Routes>
    </OnboardingCompletionGuard>
  );
};
