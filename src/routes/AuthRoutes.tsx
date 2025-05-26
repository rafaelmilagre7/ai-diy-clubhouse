
import { RouteObject } from "react-router-dom";
import Login from '@/pages/auth/Login';
import ResetPassword from '@/pages/auth/ResetPassword';
import SetNewPassword from '@/pages/auth/SetNewPassword';

export const authRoutes: RouteObject[] = [
  { path: "/login", element: <Login /> },
  // Removido o registro direto, acesso apenas por convite
  { path: "/register", element: <Login /> }, // Redireciona para login
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/set-new-password", element: <SetNewPassword /> },
];
