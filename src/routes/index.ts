
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

// Lazy loading dos componentes de layout
const AppRoutes = lazy(() => import('@/components/routing/AppRoutes'));

// Exportamos as rotas principais
export { AppRoutes };

// Exportamos também um roteador otimizado para uso futuro se necessário
export const createOptimizedRouter = () => createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<div>Carregando...</div>}>
        <AppRoutes />
      </Suspense>
    ),
  }
]);
