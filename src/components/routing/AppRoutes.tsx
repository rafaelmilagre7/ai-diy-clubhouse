
import React, { Suspense, lazy } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { AuthProvider } from "@/contexts/auth";
import { isDevelopmentMode } from "@/utils/environmentUtils";

// Layout principal
import MemberLayout from "@/components/layout/MemberLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Lazy-loaded pages para otimização de bundle
const DashboardPage = lazy(() => import("@/pages/member/Dashboard"));
const LoginPage = lazy(() => import("@/pages/auth/Login"));
const OfflinePage = lazy(() => import("@/pages/errors/Offline"));
const NotFoundPage = lazy(() => import("@/pages/errors/NotFound"));

// Configuração de fallback para carregamento
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Spinner size="lg" />
  </div>
);

const AppRoutes = () => {
  // Verificar se as variáveis de ambiente estão configuradas
  const supabaseConfigured = !!(
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  // Em produção, sem configuração de Supabase, mostrar página de offline
  if (!isDevelopmentMode() && !supabaseConfigured) {
    return (
      <Suspense fallback={<PageLoader />}>
        <OfflinePage 
          title="Erro de Configuração" 
          message="Conecte-se ao suporte técnico para configurar as variáveis de ambiente." 
        />
      </Suspense>
    );
  }

  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Rotas não autenticadas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth" element={<LoginPage />} />
          
          {/* Rotas protegidas */}
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
    </AuthProvider>
  );
};

export default AppRoutes;
