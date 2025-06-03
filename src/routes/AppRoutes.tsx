
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingScreen from '@/components/common/LoadingScreen';

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

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Rota raiz única - redireciona para login por padrão */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Rota de login pública - SEM layout */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rotas protegidas COM layout autenticado */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <DashboardPage />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/implementation-trail" 
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <ImplementationTrailPage />
              </AuthenticatedLayout>
            </ProtectedRoute>
          } 
        />

        {/* Rotas lazy com proteção E layout */}
        <Route 
          path="/comunidade/*" 
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<LoadingScreen />}>
                  <CommunityRoutes />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/learning/*" 
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<LoadingScreen />}>
                  <LearningRoutes />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/solutions/*" 
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<LoadingScreen />}>
                  <SolutionsRoutes />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/tools/*" 
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<LoadingScreen />}>
                  <ToolsRoutes />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/benefits/*" 
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<LoadingScreen />}>
                  <BenefitsRoutes />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/networking/*" 
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<LoadingScreen />}>
                  <NetworkingRoutes />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/onboarding-new/*" 
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<LoadingScreen />}>
                  <OnboardingRoutes />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AuthenticatedLayout>
                <Suspense fallback={<LoadingScreen />}>
                  <AdminRoutes />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/formacao/*" 
          element={
            <ProtectedRoute requiredRole="formacao">
              <AuthenticatedLayout>
                <Suspense fallback={<LoadingScreen />}>
                  <FormacaoRoutes />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/profile/*" 
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Suspense fallback={<LoadingScreen />}>
                  <ProfileRoutes />
                </Suspense>
              </AuthenticatedLayout>
            </ProtectedRoute>
          } 
        />

        {/* Fallback para 404 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
