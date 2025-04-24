
import { Route, Routes } from "react-router-dom";
import { authRoutes } from "./auth.routes";
import { memberRoutes } from "./member.routes";
import { adminRoutes } from "./admin.routes";
import { onboardingRoutes } from "./onboarding.routes";
import { AdminProtectedRoutes } from "@/auth/AdminProtectedRoutes";
import { ProtectedRoutes } from "@/auth/ProtectedRoutes";
import NotFound from "@/pages/NotFound";
import RootRedirect from "@/components/routing/RootRedirect";

const AppRoutes = () => {
  console.log("Renderizando AppRoutes");
  
  return (
    <Routes>
      {/* Rota raiz - redireciona com base no estado de autenticação */}
      <Route path="/" element={<RootRedirect />} />
      
      {/* Rotas de autenticação */}
      {authRoutes}
      
      {/* Rotas de onboarding diretamente acessíveis */}
      {onboardingRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={route.element}
        />
      ))}
      
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
