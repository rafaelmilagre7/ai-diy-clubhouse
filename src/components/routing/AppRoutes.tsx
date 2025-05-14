
import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import MemberLayout from "@/components/layout/MemberLayout";
import DashboardPage from "@/pages/member/Dashboard";
import LoadingScreen from "@/components/common/LoadingScreen";
import { authRoutes } from "@/routes/AuthRoutes";
import NotFoundPage from "@/pages/NotFound"; // Corrigido para o caminho correto
import AdminLayout from "@/components/layout/AdminLayout";

// Lazy loading para áreas administrativas
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers")); // Ajustado para o caminho correto
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings")); // Ajustado para o caminho correto

// Lazy loading para área de formação
const FormacaoLayout = lazy(() => import("@/components/layout/formacao/FormacaoLayout"));
const FormacaoDashboard = lazy(() => import("@/pages/formacao/FormacaoDashboard"));

/**
 * AppRoutes é o componente principal de roteamento da aplicação
 * Define todas as rotas e seus componentes correspondentes
 */
const AppRoutes = () => {
  console.log("Renderizando AppRoutes");
  
  return (
    <Suspense fallback={<LoadingScreen message="Carregando página..." />}>
      <Routes>
        {/* Rotas de autenticação */}
        {authRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        
        {/* Rotas da área administrativa */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <AdminSettings />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Rotas da área de formação */}
        <Route
          path="/formacao"
          element={
            <ProtectedRoute requiredRole="formacao">
              <FormacaoLayout>
                <FormacaoDashboard />
              </FormacaoLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Rotas da área de membros */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <MemberLayout>
                <DashboardPage />
              </MemberLayout>
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <MemberLayout>
                <DashboardPage />
              </MemberLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Página 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
