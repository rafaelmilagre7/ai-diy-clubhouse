
import React, { Suspense } from 'react';
import LoadingScreen from '@/components/common/LoadingScreen';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { ProtectedRoute } from './ProtectedRoute';

interface ProtectedRouteWrapperProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requiredRole?: string;
}

/**
 * Wrapper que combina ProtectedRoute + AuthenticatedLayout + Suspense
 * para simplificar o uso em rotas protegidas
 */
export const ProtectedRouteWrapper: React.FC<ProtectedRouteWrapperProps> = ({
  children,
  requireAdmin = false,
  requiredRole
}) => {
  return (
    <ProtectedRoute requireAdmin={requireAdmin} requiredRole={requiredRole}>
      <AuthenticatedLayout>
        <Suspense fallback={<LoadingScreen />}>
          {children}
        </Suspense>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
};

export default ProtectedRouteWrapper;
