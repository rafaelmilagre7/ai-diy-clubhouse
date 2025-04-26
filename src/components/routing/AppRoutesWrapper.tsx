
import React, { Suspense, lazy } from 'react';
import LoadingScreen from '@/components/common/LoadingSpinner';

// Lazy loading do componente principal de rotas
const AppRoutes = lazy(() => import('@/components/routing/AppRoutes'));

const AppRoutesWrapper = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AppRoutes />
    </Suspense>
  );
};

export default AppRoutesWrapper;
