
import { RouteObject } from "react-router-dom";
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import TrilhaSolutionsPage from '@/pages/dashboard/TrihaSolutionsPage';
import NetworkingPage from '@/pages/dashboard/NetworkingPage';

export const mainRoutes: RouteObject[] = [
  {
    path: "/solutions",
    element: <ProtectedRoutes><TrilhaSolutionsPage /></ProtectedRoutes>
  },
  {
    path: "/networking",
    element: <ProtectedRoutes><NetworkingPage /></ProtectedRoutes>
  }
];
