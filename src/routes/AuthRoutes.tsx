
import { RouteObject } from "react-router-dom";
import { SimpleRedirectHandler } from '@/components/routing/SmartRedirectHandler';
import LoginPage from '@/pages/auth/LoginPage';

export const authRoutes: RouteObject[] = [
  // Rota raiz com redirecionamento inteligente
  {
    path: "/",
    element: <SimpleRedirectHandler />
  },
  // Login
  {
    path: "/login",
    element: <LoginPage />
  }
];
