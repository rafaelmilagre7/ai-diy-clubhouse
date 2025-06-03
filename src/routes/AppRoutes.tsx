
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useAuth } from '@/contexts/auth';

// Imports diretos para evitar lazy loading circular
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/app/DashboardPage';
import ImplementationTrailPage from '@/pages/member/ImplementationTrailPage';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

// Lazy imports apenas para páginas não críticas
const CommunityRoutes = React.lazy(() => import('./CommunityRoutes'));
const LearningRoutes = React.lazy(() => import('./LearningRoutes'));
const SolutionsRoutes = React.lazy(() => import('./SolutionsRoutes'));
const ToolsRoutes = React.lazy(() => import('./ToolsRoutes'));
const BenefitsRoutes = React.lazy(() => import('./BenefitsRoutes'));
const NetworkingRoutes = React.lazy(() => import('./NetworkingRoutes'));
const OnboardingRoutes = React.lazy(() => import('./OnboardingRoutes'));
const AdminRoutes = React.lazy(() => import('./AdminRoutes'));
const FormacaoRoutes = React.lazy(() => import('./FormacaoRoutes'));
const ProfileRoutes = React.lazy(() => import('./ProfileRoutes'));

// Componentes de proteção com imports diretos
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';

// Componente para redirecionamento inteligente na rota raiz
const RootRedirect = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen message="Carregando..." />;
  }
  
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* ÚNICA rota raiz com redirecionamento inteligente */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* Rota de login pública - SEM layout */}
        <Route path="/login" element={<LoginPage />} />

        {/* Todas as rotas protegidas COM AuthenticatedLayout */}
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<LoadingScreen />}>
                  <Routes>
                    {/* Dashboard */}
                    <Route path="/dashboard" element={<DashboardPage />} />
                    
                    {/* Implementation Trail */}
                    <Route path="/implementation-trail" element={<ImplementationTrailPage />} />

                    {/* Rotas lazy com suspense próprio */}
                    <Route path="/comunidade/*" element={<CommunityRoutes />} />
                    <Route path="/learning/*" element={<LearningRoutes />} />
                    <Route path="/solutions/*" element={<SolutionsRoutes />} />
                    <Route path="/tools/*" element={<ToolsRoutes />} />
                    <Route path="/benefits/*" element={<BenefitsRoutes />} />
                    <Route path="/networking/*" element={<NetworkingRoutes />} />
                    <Route path="/onboarding-new/*" element={<OnboardingRoutes />} />
                    <Route path="/profile/*" element={<ProfileRoutes />} />

                    {/* Rotas administrativas */}
                    <Route 
                      path="/admin/*" 
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <AdminRoutes />
                        </ProtectedRoute>
                      } 
                    />

                    <Route 
                      path="/formacao/*" 
                      element={
                        <ProtectedRoute requiredRole="formacao">
                          <FormacaoRoutes />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Fallback para 404 dentro das rotas autenticadas */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
