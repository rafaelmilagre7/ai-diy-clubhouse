
import { Navigate } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';
import PublicRoute from '@/components/auth/PublicRoute';
import RootRedirect from '@/components/routing/RootRedirect';
import { lazy } from 'react';

const LoginPage = lazy(() => import('@/pages/LoginPage'));

export const authRoutes = [
  {
    path: '/',
    element: <RootRedirect />
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <AuthLayout>
          <LoginPage />
        </AuthLayout>
      </PublicRoute>
    )
  },
  {
    path: '/auth',
    element: <Navigate to="/login" replace />
  }
];
