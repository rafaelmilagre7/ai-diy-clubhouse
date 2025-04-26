
import { createBrowserRouter } from 'react-router-dom';
import AppRoutesWrapper from '@/components/routing/AppRoutesWrapper';
import AppRoutes from '@/components/routing/AppRoutes';

// Exportar AppRoutes como um export nomeado
export { AppRoutes };

// Exportamos um roteador otimizado para uso futuro, usando array de rotas
// Não usar lazy loading para as rotas principais
export const createOptimizedRouter = () => createBrowserRouter([
  {
    path: '/',
    element: <AppRoutesWrapper />,
    children: [] // Rotas são definidas estaticamente em AppRoutes
  }
]);
