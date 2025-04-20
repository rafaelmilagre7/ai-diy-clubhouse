
import { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { AdminRoutes } from "./AdminRoutes";
import { MemberRoutes } from "./MemberRoutes";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import LoadingScreen from "@/components/common/LoadingScreen";

interface AppRoutesProps {
  children?: ReactNode;
}

/**
 * AppRoutes é responsável por configurar a estrutura principal de roteamento
 * Inclui rotas de administração e de membros com verificações de autenticação
 */
const AppRoutes = ({ children }: AppRoutesProps) => {
  return (
    <Routes>
      {/* Rotas de administração - protegidas por verificação de papel de administrador */}
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminRoutes>{children}</AdminRoutes>
          </ProtectedRoute>
        } 
      />

      {/* Rotas de membros - protegidas por verificação básica de autenticação */}
      <Route 
        path="*" 
        element={
          <ProtectedRoute>
            <MemberRoutes>{children}</MemberRoutes>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default AppRoutes;
