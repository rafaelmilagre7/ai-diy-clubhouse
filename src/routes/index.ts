
import React, { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import LoadingScreen from '@/components/common/LoadingSpinner';

// Lazy loading do componente principal de rotas
const AppRoutes = lazy(() => import('@/components/routing/AppRoutes'));

// Exportamos as rotas principais
export { AppRoutes };

// Exportamos também um roteador otimizado para uso futuro se necessário
export const createOptimizedRouter = () => createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <AppRoutes />
      </Suspense>
    ),
  }
]);
