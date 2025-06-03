
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { RoleGuard } from '../guards/RoleGuard';
import { lazy, Suspense } from 'react';
import LoadingScreen from '@/components/common/LoadingScreen';

// Lazy loading das páginas de formação
const FormacaoDashboard = lazy(() => import('@/pages/formacao/FormacaoDashboard'));

export const FormacaoRoutes: React.FC = () => {
  return (
    <RoleGuard allowedRoles={['formacao', 'admin']} requireOnboarding={false}>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/formacao" element={<FormacaoDashboard />} />
          <Route path="/formacao/*" element={<FormacaoDashboard />} />
        </Routes>
      </Suspense>
    </RoleGuard>
  );
};
