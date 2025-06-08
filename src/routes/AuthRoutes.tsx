
import { Navigate } from 'react-router-dom';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthProtectedRoutes from '@/components/auth/AuthProtectedRoutes';
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
      <AuthProtectedRoutes>
        <AuthLayout>
          <LoginPage />
        </AuthLayout>
      </AuthProtectedRoutes>
    )
  },
  {
    path: '/auth',
    element: <Navigate to="/login" replace />
  }
];
