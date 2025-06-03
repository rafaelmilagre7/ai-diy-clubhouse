
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

export const AppRoutesNew: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Rotas de onboarding */}
        <Route path="/onboarding-new/*" element={<OnboardingRoutes />} />
        
        {/* Rotas por role */}
        <Route path="/*" element={<MemberRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/formacao/*" element={<FormacaoRoutes />} />
        
        {/* 404 */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutesNew;
