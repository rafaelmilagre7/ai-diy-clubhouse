
import React from 'react';
import { Navigate, RouteObject } from "react-router-dom";
import { memberRoutes } from './MemberRoutes';
import { onboardingRoutes } from './OnboardingRoutes';

// Rota padrão que redireciona para o dashboard
const defaultRoute: RouteObject = {
  path: "/",
  element: <Navigate to="/dashboard" replace />
};

// Combinar todas as rotas do sistema
export const appRoutes: RouteObject[] = [
  defaultRoute,
  ...memberRoutes,
  ...onboardingRoutes,
  // Adicionar outras rotas conforme necessário
];
