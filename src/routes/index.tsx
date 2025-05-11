
import { createBrowserRouter, RouteObject } from "react-router-dom";

import { PublicRoutes } from "./PublicRoutes";
import { adminRoutes } from "./AdminRoutes";

import RootLayout from '@/components/layout/RootLayout';
import ErrorPage from "@/pages/ErrorPage";
import NotFoundPage from "@/pages/NotFoundPage";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import InvitePage from "@/pages/InvitePage";

// Definição das rotas principais
const mainRoutes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      ...PublicRoutes,
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/convite/:token",
    element: <InvitePage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
];

// Combinar todas as rotas
export const routes = [
  ...mainRoutes,
  ...adminRoutes,
];

// Criar o router
export const router = createBrowserRouter(routes);
