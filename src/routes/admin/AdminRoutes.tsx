
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { RoleGuard } from '../guards/RoleGuard';
import { lazy, Suspense } from 'react';
import LoadingScreen from '@/components/common/LoadingScreen';

// Lazy loading das páginas de admin
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));

export const AdminRoutes: React.FC = () => {
  return (
    <RoleGuard allowedRoles={['admin']} requireOnboarding={false}>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </Suspense>
    </RoleGuard>
  );
};
