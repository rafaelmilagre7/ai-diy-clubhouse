
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { publicRoutes } from './PublicRoutes';
import { memberRoutes } from './MemberRoutes';
import { adminRoutes } from './AdminRoutes';
import { formacaoRoutes } from './FormacaoRoutes';
import RouteErrorBoundary from '@/components/common/RouteErrorBoundary';
import ErrorFallback from '@/components/common/ErrorFallback';
import LoadingScreen from '@/components/common/LoadingScreen';

// Wrapper simples para compatibilidade com react-error-boundary
const SimpleErrorFallback = ({ error, resetErrorBoundary }: any) => {
  return (
    <ErrorFallback
      error={error}
      errorInfo={null}
      onRetry={resetErrorBoundary}
      onGoHome={() => window.location.href = '/dashboard'}
      retryCount={0}
      maxRetries={3}
      showDetails={true}
    />
  );
};

const AppRoutes = () => {
  return (
    <ErrorBoundary
      FallbackComponent={SimpleErrorFallback}
      onError={(error, errorInfo) => {
        console.error('App-level error:', error, errorInfo);
      }}
    >
      <RouteErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={publicRoutes.find(r => r.path === "/login")?.element} />
            <Route path="/register" element={publicRoutes.find(r => r.path === "/register")?.element} />
            <Route path="/reset-password" element={publicRoutes.find(r => r.path === "/reset-password")?.element} />
            <Route path="/set-new-password" element={publicRoutes.find(r => r.path === "/set-new-password")?.element} />
            <Route path="/invite/:token" element={publicRoutes.find(r => r.path === "/invite/:token")?.element} />
            <Route path="/onboarding" element={publicRoutes.find(r => r.path === "/onboarding")?.element} />

            {/* Member Routes */}
            <Route path="/" element={memberRoutes.find(r => r.path === "/")?.element} />
            <Route path="/dashboard" element={memberRoutes.find(r => r.path === "/dashboard")?.element} />
            <Route path="/profile" element={memberRoutes.find(r => r.path === "/profile")?.element} />
            <Route path="/tools" element={memberRoutes.find(r => r.path === "/tools")?.element} />
            <Route path="/tools/:id" element={memberRoutes.find(r => r.path === "/tools/:id")?.element} />
            <Route path="/solutions" element={memberRoutes.find(r => r.path === "/solutions")?.element} />
            <Route path="/solutions/:id" element={memberRoutes.find(r => r.path === "/solutions/:id")?.element} />
            <Route path="/implementation/:id" element={memberRoutes.find(r => r.path === "/implementation/:id")?.element} />
            <Route path="/implementation/:id/:moduleIndex" element={memberRoutes.find(r => r.path === "/implementation/:id/:moduleIndex")?.element} />
            <Route path="/implementation-trail" element={memberRoutes.find(r => r.path === "/implementation-trail")?.element} />
            <Route path="/community" element={memberRoutes.find(r => r.path === "/community")?.element} />
            <Route path="/community/:categoryId" element={memberRoutes.find(r => r.path === "/community/:categoryId")?.element} />
            <Route path="/community/:categoryId/:topicId" element={memberRoutes.find(r => r.path === "/community/:categoryId/:topicId")?.element} />
            <Route path="/suggestions" element={memberRoutes.find(r => r.path === "/suggestions")?.element} />
            <Route path="/suggestions/:id" element={memberRoutes.find(r => r.path === "/suggestions/:id")?.element} />
            <Route path="/events" element={memberRoutes.find(r => r.path === "/events")?.element} />
            <Route path="/learning" element={memberRoutes.find(r => r.path === "/learning")?.element} />
            <Route path="/learning/:courseId" element={memberRoutes.find(r => r.path === "/learning/:courseId")?.element} />
            <Route path="/learning/:courseId/:lessonId" element={memberRoutes.find(r => r.path === "/learning/:courseId/:lessonId")?.element} />

            {/* Admin Routes */}
            <Route path="/admin" element={adminRoutes.find(r => r.path === "/admin")?.element} />
            <Route path="/admin/users" element={adminRoutes.find(r => r.path === "/admin/users")?.element} />
            <Route path="/admin/tools" element={adminRoutes.find(r => r.path === "/admin/tools")?.element} />
            <Route path="/admin/tools/new" element={adminRoutes.find(r => r.path === "/admin/tools/new")?.element} />
            <Route path="/admin/tools/:id" element={adminRoutes.find(r => r.path === "/admin/tools/:id")?.element} />
            <Route path="/admin/solutions" element={adminRoutes.find(r => r.path === "/admin/solutions")?.element} />
            <Route path="/admin/solutions/new" element={adminRoutes.find(r => r.path === "/admin/solutions/new")?.element} />
            <Route path="/admin/solutions/:id" element={adminRoutes.find(r => r.path === "/admin/solutions/:id")?.element} />
            <Route path="/admin/analytics" element={adminRoutes.find(r => r.path === "/admin/analytics")?.element} />
            <Route path="/admin/suggestions" element={adminRoutes.find(r => r.path === "/admin/suggestions")?.element} />
            <Route path="/admin/events" element={adminRoutes.find(r => r.path === "/admin/events")?.element} />
            <Route path="/admin/roles" element={adminRoutes.find(r => r.path === "/admin/roles")?.element} />
            <Route path="/admin/invites" element={adminRoutes.find(r => r.path === "/admin/invites")?.element} />
            <Route path="/admin/communications" element={adminRoutes.find(r => r.path === "/admin/communications")?.element} />
            <Route path="/admin/security" element={adminRoutes.find(r => r.path === "/admin/security")?.element} />
            <Route path="/admin/whatsapp-debug" element={adminRoutes.find(r => r.path === "/admin/whatsapp-debug")?.element} />
            <Route path="/admin/email-debug" element={adminRoutes.find(r => r.path === "/admin/email-debug")?.element} />
            <Route path="/admin/diagnostics" element={adminRoutes.find(r => r.path === "/admin/diagnostics")?.element} />

            {/* Formação (LMS) Routes */}
            <Route path="/formacao" element={formacaoRoutes.find(r => r.path === "/formacao")?.element} />
            <Route path="/formacao/dashboard" element={formacaoRoutes.find(r => r.path === "/formacao/dashboard")?.element} />
            <Route path="/formacao/cursos" element={formacaoRoutes.find(r => r.path === "/formacao/cursos")?.element} />
            <Route path="/formacao/cursos/:id" element={formacaoRoutes.find(r => r.path === "/formacao/cursos/:id")?.element} />
            <Route path="/formacao/aulas" element={formacaoRoutes.find(r => r.path === "/formacao/aulas")?.element} />
            <Route path="/formacao/aulas/new" element={formacaoRoutes.find(r => r.path === "/formacao/aulas/new")?.element} />
            <Route path="/formacao/aulas/:id" element={formacaoRoutes.find(r => r.path === "/formacao/aulas/:id")?.element} />
            <Route path="/formacao/modulos" element={formacaoRoutes.find(r => r.path === "/formacao/modulos")?.element} />
            <Route path="/formacao/modulos/:id" element={formacaoRoutes.find(r => r.path === "/formacao/modulos/:id")?.element} />
            <Route path="/formacao/materiais" element={formacaoRoutes.find(r => r.path === "/formacao/materiais")?.element} />
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </ErrorBoundary>
  );
};

export default AppRoutes;
