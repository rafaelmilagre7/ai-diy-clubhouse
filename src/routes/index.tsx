
import { Route, Routes } from "react-router-dom";
import { authRoutes } from "./auth.routes";
import { memberRoutes } from "./member.routes";
import { adminRoutes } from "./admin.routes";
import { AdminProtectedRoutes } from "@/auth/AdminProtectedRoutes";
import { ProtectedRoutes } from "@/auth/ProtectedRoutes";
import NotFound from "@/pages/NotFound";
import RootRedirect from "@/components/routing/RootRedirect";
import ImplementationProfilePage from "@/pages/ImplementationProfile";

const AppRoutes = () => {
  console.log("Renderizando AppRoutes");
  
  return (
    <Routes>
      {/* Rota raiz - redireciona com base no estado de autenticação */}
      <Route path="/" element={<RootRedirect />} />
      
      {/* Rotas de autenticação */}
      {authRoutes}
      
      {/* Rota para perfil de implementação */}
      <Route path="/perfil-de-implementacao" element={
        <ProtectedRoutes>
          <ImplementationProfilePage />
        </ProtectedRoutes>
      } />
      
      {/* Rotas de membros protegidas */}
      <Route path="/*" element={<ProtectedRoutes />}>
        {memberRoutes}
      </Route>
      
      {/* Rotas de administradores protegidas */}
      <Route path="/admin/*" element={<AdminProtectedRoutes />}>
        {adminRoutes}
      </Route>
      
      {/* Rota para página não encontrada */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export { AppRoutes };
export default AppRoutes;
