
import { RouteObject } from "react-router-dom";
import Login from '@/pages/auth/Login';
import LoginPage from '@/pages/auth/LoginPage';
import ResetPassword from '@/pages/auth/ResetPassword';
import SetNewPassword from '@/pages/auth/SetNewPassword';

export const authRoutes: RouteObject[] = [
  // NOVO PADRÃO: /login como rota principal
  { path: "/login", element: <Login /> },
  
  // LEGACY: manter /auth ativo como fallback para compatibilidade
  { path: "/auth", element: <Login /> }, // Redireciona para o mesmo design
  
  // LEGACY: manter /register por compatibilidade (acesso por convite)
  { path: "/register", element: <Login /> },
  
  // Rotas específicas de senha
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/set-new-password", element: <SetNewPassword /> },
];
