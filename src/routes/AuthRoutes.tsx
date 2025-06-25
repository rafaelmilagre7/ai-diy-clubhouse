
import { RouteObject } from "react-router-dom";
import AuthLayout from '@/components/auth/AuthLayout';
import ResetPassword from '@/pages/auth/ResetPassword';
import SetNewPassword from '@/pages/auth/SetNewPassword';

export const authRoutes: RouteObject[] = [
  { path: "/login", element: <AuthLayout /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/set-new-password", element: <SetNewPassword /> },
];
