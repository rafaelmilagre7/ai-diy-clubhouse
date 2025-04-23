
import React, { Suspense } from 'react';
import { Route, Routes } from "react-router-dom";
import { authRoutes } from "./auth.routes";
import { memberRoutes } from "./member.routes";
import { adminRoutes } from "./admin.routes";
import { AdminProtectedRoutes } from "@/auth/AdminProtectedRoutes";
import { ProtectedRoutes } from "@/auth/ProtectedRoutes";
import NotFound from "@/pages/NotFound";
import RootRedirect from "@/components/routing/RootRedirect";
import { useLogging } from "@/hooks/useLogging";
import LoadingScreen from "@/components/common/LoadingScreen";

const AppRoutes = () => {
  const { log } = useLogging("AppRoutes");
  
  // Log para debug
  log("Renderizando as rotas da aplicação");
  
  return (
    <Routes>
      {/* Rota raiz - redireciona com base no estado de autenticação */}
      <Route path="/" element={<RootRedirect />} />
      
      {/* Rotas de autenticação - acessíveis publicamente */}
      {authRoutes}
      
      {/* Rotas de membros protegidas */}
      <Route element={<ProtectedRoutes />}>
        {memberRoutes}
      </Route>
      
      {/* Rotas de administradores protegidas */}
      <Route element={<AdminProtectedRoutes />}>
        {adminRoutes}
      </Route>
      
      {/* Rota para página não encontrada */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export { AppRoutes };
export default AppRoutes;
