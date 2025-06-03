
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingScreen from '@/components/common/LoadingScreen';

// Imports diretos para evitar lazy loading circular
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/app/DashboardPage';
import ImplementationTrailPage from '@/pages/member/ImplementationTrailPage';

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
        
        {/* Rota de login pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rotas protegidas básicas */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/implementation-trail" 
          element={
            <ProtectedRoute>
              <ImplementationTrailPage />
            </ProtectedRoute>
          } 
        />

        {/* Rotas lazy com proteção */}
        <Route 
          path="/comunidade/*" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingScreen />}>
                <CommunityRoutes />
              </Suspense>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/learning/*" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingScreen />}>
                <LearningRoutes />
              </Suspense>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/solutions/*" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingScreen />}>
                <SolutionsRoutes />
              </Suspense>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/tools/*" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingScreen />}>
                <ToolsRoutes />
              </Suspense>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/benefits/*" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingScreen />}>
                <BenefitsRoutes />
              </Suspense>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/networking/*" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingScreen />}>
                <NetworkingRoutes />
              </Suspense>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/onboarding-new/*" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingScreen />}>
                <OnboardingRoutes />
              </Suspense>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <Suspense fallback={<LoadingScreen />}>
                <AdminRoutes />
              </Suspense>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/formacao/*" 
          element={
            <ProtectedRoute requiredRole="formacao">
              <Suspense fallback={<LoadingScreen />}>
                <FormacaoRoutes />
              </Suspense>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/profile/*" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingScreen />}>
                <ProfileRoutes />
              </Suspense>
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
