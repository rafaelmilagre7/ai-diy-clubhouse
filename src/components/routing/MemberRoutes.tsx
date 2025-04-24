
import { Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import LoadingScreen from "@/components/common/LoadingScreen";
import MemberGuard from "@/components/auth/MemberGuard";

// Importação lazy dos componentes de membro
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const SolutionsPage = lazy(() => import("@/pages/solutions/SolutionsPage"));
const SolutionDetails = lazy(() => import("@/pages/solutions/SolutionDetails"));
const ProfilePage = lazy(() => import("@/pages/profile/ProfilePage"));
const SystemDiagnostic = lazy(() => import("@/pages/system/SystemDiagnostic"));

/**
 * MemberRoutes - Rotas para a área de membros
 * Define as rotas disponíveis para usuários com perfil de membro
 */
const MemberRoutes = () => {
  return (
    <Routes>
      {/* Dashboard principal do membro */}
      <Route 
        path="/" 
        element={
          <Suspense fallback={<LoadingScreen message="Carregando seu dashboard..." />}>
            <Dashboard />
          </Suspense>
        } 
      />

      {/* Listagem de soluções */}
      <Route 
        path="/solutions" 
        element={
          <Suspense fallback={<LoadingScreen message="Carregando soluções..." />}>
            <SolutionsPage />
          </Suspense>
        } 
      />

      {/* Detalhes de uma solução específica */}
      <Route 
        path="/solutions/:id" 
        element={
          <Suspense fallback={<LoadingScreen message="Carregando detalhes da solução..." />}>
            <SolutionDetails />
          </Suspense>
        } 
      />

      {/* Perfil do usuário */}
      <Route 
        path="/profile" 
        element={
          <Suspense fallback={<LoadingScreen message="Carregando perfil..." />}>
            <ProfilePage />
          </Suspense>
        } 
      />

      {/* Página de diagnóstico */}
      <Route 
        path="/diagnostic" 
        element={
          <Suspense fallback={<LoadingScreen message="Carregando diagnóstico do sistema..." />}>
            <SystemDiagnostic />
          </Suspense>
        } 
      />

      {/* Redirecionar qualquer outra rota para o dashboard */}
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
};

export default MemberRoutes;
