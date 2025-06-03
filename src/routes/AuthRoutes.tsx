
import { RouteObject } from "react-router-dom";
import LoginPage from '@/pages/auth/LoginPage';

// Componente simples para redirecionamento sem dependências circulares
const RootRedirect = () => {
  // Usar window.location diretamente para evitar hooks durante inicialização
  if (typeof window !== 'undefined') {
    const isAuthenticated = localStorage.getItem('supabase.auth.token');
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/login';
    }
  }
  return null;
};

export const authRoutes: RouteObject[] = [
  // Rota raiz com redirecionamento simples
  {
    path: "/",
    element: <RootRedirect />
  },
  // Login
  {
    path: "/login",
    element: <LoginPage />
  }
];
