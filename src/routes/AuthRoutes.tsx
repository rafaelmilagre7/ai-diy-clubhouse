
import { RouteObject } from "react-router-dom";
import ModernLogin from '@/pages/auth/ModernLogin';
import ResetPassword from '@/pages/auth/ResetPassword';
import SetNewPassword from '@/pages/auth/SetNewPassword';

export const authRoutes: RouteObject[] = [
  { path: "/login", element: <ModernLogin /> },
  // Removido o registro direto, acesso apenas por convite
  { path: "/register", element: <ModernLogin /> }, // Redireciona para login
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/set-new-password", element: <SetNewPassword /> },
];
