
import { createBrowserRouter } from 'react-router-dom';
import AppRoutesWrapper from '@/components/routing/AppRoutesWrapper';
import AppRoutes from '@/components/routing/AppRoutes';

// Exportar AppRoutes como um export nomeado
export { AppRoutes };

// Exportamos um roteador otimizado para uso futuro, usando array de rotas
export const createOptimizedRouter = () => createBrowserRouter([
  {
    path: '/',
    element: <AppRoutesWrapper />
  }
]);
