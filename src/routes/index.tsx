
import React from 'react';
import { Navigate, RouteObject } from "react-router-dom";
import { memberRoutes } from './MemberRoutes';
import { onboardingRoutes } from './OnboardingRoutes';
import { formacaoRoutes } from './FormacaoRoutes';
import { adminRoutes } from './AdminRoutes';
import { authRoutes } from './AuthRoutes';

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
  ...formacaoRoutes,
  ...adminRoutes,
  ...authRoutes,
  // Adicionar outras rotas conforme necessário
];

// Criando um componente exportável para uso pelo App.tsx
import { Routes, Route } from "react-router-dom";
import NotFound from '@/pages/NotFound';
import InvitePage from '@/pages/InvitePage';

const AppRoutes = () => {
  console.log("AppRoutes renderizando...");
  return (
    <Routes>
      {/* Convite Routes - Alta prioridade e fora do sistema de autenticação */}
      <Route path="/convite/:token" element={<InvitePage />} />
      <Route path="/convite" element={<InvitePage />} />
      
      {/* Mapear todas as rotas */}
      {appRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      
      {/* Fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
