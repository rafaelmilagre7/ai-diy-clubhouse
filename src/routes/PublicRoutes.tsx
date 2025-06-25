
import { RouteObject } from "react-router-dom";
import PublicRoute from '@/components/auth/PublicRoute';

// Páginas públicas
import Auth from '@/pages/Auth';

// Função helper para criar rotas públicas
const createPublicRoute = (path: string, Component: React.ComponentType<any>) => ({
  path,
  element: (
    <PublicRoute>
      <Component />
    </PublicRoute>
  )
});

export const publicRoutes: RouteObject[] = [
  createPublicRoute("/login", Auth),
];
