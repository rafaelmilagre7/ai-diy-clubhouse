
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MemberRoutes } from './member/MemberRoutes';
import { AdminRoutes } from './admin/AdminRoutes';
import { FormacaoRoutes } from './formacao/FormacaoRoutes';
import { OnboardingRoutes } from './onboarding/OnboardingRoutes';
import { lazy, Suspense } from 'react';
import LoadingScreen from '@/components/common/LoadingScreen';

// Páginas gerais
const NotFound = lazy(() => import('@/pages/NotFound'));
const SimpleOnboardingPage = lazy(() => import('@/pages/onboarding/SimpleOnboardingPage'));

export const AppRoutesNew: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Rota raiz */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Rotas de onboarding */}
        <Route path="/onboarding-new/*" element={<OnboardingRoutes />} />
        <Route path="/simple-onboarding" element={<SimpleOnboardingPage />} />
        
        {/* Rotas por role - ordem específica */}
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/formacao/*" element={<FormacaoRoutes />} />
        
        {/* Rotas de membros - deve vir por último para capturar todas as outras rotas */}
        <Route path="/*" element={<MemberRoutes />} />
        
        {/* 404 - fallback final */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutesNew;
