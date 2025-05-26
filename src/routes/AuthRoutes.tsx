
import { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Login from '@/pages/Login';
import ResetPassword from '@/pages/auth/ResetPassword';
import SetNewPassword from '@/pages/auth/SetNewPassword';

export const authRoutes: RouteObject[] = [
  { path: "/login", element: <Login /> },
  { path: "/auth", element: <Navigate to="/login" replace /> }, // Redirect antiga rota
  { path: "/register", element: <Navigate to="/login" replace /> }, // Redirect para login
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/set-new-password", element: <SetNewPassword /> },
];
