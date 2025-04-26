
import { createBrowserRouter } from 'react-router-dom';
import AppRoutesWrapper from '@/components/routing/AppRoutesWrapper';

// Lazy loading implementado no wrapper
import AppRoutes from '@/components/routing/AppRoutes';
export { AppRoutes };

// Exportamos um roteador otimizado para uso futuro
export const createOptimizedRouter = () => createBrowserRouter([
  {
    path: '/',
    element: <AppRoutesWrapper />
  }
]);
