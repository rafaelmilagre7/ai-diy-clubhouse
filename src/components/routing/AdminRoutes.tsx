
import { Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import LoadingScreen from "@/components/common/LoadingScreen";

// Importação lazy dos componentes de administração
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const SystemDiagnostic = lazy(() => import("@/pages/system/SystemDiagnostic"));

/**
 * AdminRoutes - Rotas para a área administrativa
 * Define as rotas disponíveis para usuários com perfil de administrador
 */
const AdminRoutes = () => {
  return (
    <Routes>
      {/* Página principal do admin */}
      <Route 
        path="/" 
        element={
          <Suspense fallback={<LoadingScreen message="Carregando dashboard administrativo..." />}>
            <AdminDashboard />
          </Suspense>
        } 
      />
      
      {/* Página de diagnóstico do sistema */}
      <Route 
        path="/diagnostic" 
        element={
          <Suspense fallback={<LoadingScreen message="Carregando diagnóstico do sistema..." />}>
            <SystemDiagnostic />
          </Suspense>
        } 
      />

      {/* Redirecionar qualquer outra rota para o dashboard admin */}
      <Route path="*" element={<AdminDashboard />} />
    </Routes>
  );
};

export default AdminRoutes;
