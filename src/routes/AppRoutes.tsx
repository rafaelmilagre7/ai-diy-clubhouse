
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import LoadingScreen from '@/components/common/LoadingScreen';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';
import { AdminProtectedRoutes } from '@/auth/AdminProtectedRoutes';
import { FormacaoProtectedRoutes } from '@/auth/FormacaoProtectedRoutes';
import { SmartFeatureGuard } from '@/components/auth/SmartFeatureGuard';

// Lazy loading para todas as páginas
const LazyLoginPage = React.lazy(() => import('@/pages/auth/LoginPage'));
const LazyDashboard = React.lazy(() => import('@/pages/member/Dashboard'));
const LazyProfile = React.lazy(() => import('@/pages/member/Profile'));
const LazyEditProfile = React.lazy(() => import('@/pages/member/EditProfile'));
const LazyImplementationTrail = React.lazy(() => import('@/pages/member/ImplementationTrail'));
const LazyNotFound = React.lazy(() => import('@/pages/NotFound'));

// Lazy loading para rotas de comunidade
const LazyCommunityHome = React.lazy(() => import('@/pages/member/community/CommunityHome'));
const LazyTopicView = React.lazy(() => import('@/pages/member/community/TopicView'));
const LazyCategoryView = React.lazy(() => import('@/pages/member/community/CategoryView'));
const LazyNewTopic = React.lazy(() => import('@/pages/member/community/NewTopic'));

// Lazy loading para learning
const LazyLearningPage = React.lazy(() => import('@/pages/member/learning/LearningPage'));
const LazyCourseDetails = React.lazy(() => import('@/pages/member/learning/CourseDetails'));
const LazyLessonView = React.lazy(() => import('@/pages/member/learning/LessonView'));

// Lazy loading para soluções
const LazySolutionsPage = React.lazy(() => import('@/pages/member/SolutionsPage'));
const LazySolutionDetails = React.lazy(() => import('@/pages/member/SolutionDetails'));
const LazySolutionImplementation = React.lazy(() => import('@/pages/member/SolutionImplementation'));

// Lazy loading para tools e benefits
const LazyToolsPage = React.lazy(() => import('@/pages/member/tools/ToolsPage'));
const LazyBenefitsPage = React.lazy(() => import('@/pages/member/BenefitsPage'));
const LazyEventsPage = React.lazy(() => import('@/pages/member/Events'));
const LazySuggestionsPage = React.lazy(() => import('@/pages/member/Suggestions'));
const LazyNetworkingPage = React.lazy(() => import('@/pages/member/networking/NetworkingPage'));

// Lazy loading para admin
const LazyAdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard'));
const LazyAdminAnalytics = React.lazy(() => import('@/pages/admin/AdminAnalytics'));
const LazyAdminSolutions = React.lazy(() => import('@/pages/admin/AdminSolutions'));
const LazyAdminUsers = React.lazy(() => import('@/pages/admin/AdminUsers'));
const LazyAdminEvents = React.lazy(() => import('@/pages/admin/AdminEvents'));

// Lazy loading para formação
const LazyFormacaoDashboard = React.lazy(() => import('@/pages/formacao/FormacaoDashboard'));
const LazyFormacaoCursos = React.lazy(() => import('@/pages/formacao/FormacaoCursos'));
const LazyFormacaoAulas = React.lazy(() => import('@/pages/formacao/FormacaoAulas'));

// Lazy loading para onboarding
const LazyOnboardingFinalFlow = React.lazy(() => import('@/components/onboarding/final/OnboardingFinalFlow'));
const LazyOnboardingCompleted = React.lazy(() => import('@/pages/onboarding/OnboardingFinalCompleted'));

// Componente de fallback para Suspense
const SuspenseFallback = ({ message = "Carregando..." }: { message?: string }) => (
  <LoadingScreen message={message} variant="skeleton" />
);

// Componente para rotas protegidas com Suspense
const ProtectedSuspenseRoute = ({ 
  children, 
  requireAdmin = false, 
  requireFormacao = false,
  requireOnboarding = true,
  message = "Carregando..."
}: { 
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireFormacao?: boolean;
  requireOnboarding?: boolean;
  message?: string;
}) => (
  <ProtectedRoute 
    requireAdmin={requireAdmin} 
    requiredRole={requireAdmin ? 'admin' : requireFormacao ? 'formacao' : undefined}
    requireOnboarding={requireOnboarding}
  >
    <Suspense fallback={<SuspenseFallback message={message} />}>
      {children}
    </Suspense>
  </ProtectedRoute>
);

// Componente para redirecionamento baseado em role
const SmartRedirect = () => {
  const { user, isAdmin, isFormacao, isLoading } = useAuth();
  
  if (isLoading) {
    return <SuspenseFallback message="Redirecionando..." />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  
  if (isFormacao) {
    return <Navigate to="/formacao" replace />;
  }
  
  return <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route 
        path="/" 
        element={<SmartRedirect />} 
      />
      <Route 
        path="/login" 
        element={
          <Suspense fallback={<SuspenseFallback message="Carregando login..." />}>
            <LazyLoginPage />
          </Suspense>
        } 
      />

      {/* Rotas Protegidas - Membros */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedSuspenseRoute message="Carregando dashboard...">
            <LazyDashboard />
          </ProtectedSuspenseRoute>
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedSuspenseRoute requireOnboarding={false} message="Carregando perfil...">
            <LazyProfile />
          </ProtectedSuspenseRoute>
        } 
      />
      
      <Route 
        path="/profile/edit" 
        element={
          <ProtectedSuspenseRoute requireOnboarding={false} message="Carregando edição...">
            <LazyEditProfile />
          </ProtectedSuspenseRoute>
        } 
      />

      <Route 
        path="/implementation-trail" 
        element={
          <ProtectedSuspenseRoute message="Carregando trilha...">
            <SmartFeatureGuard feature="implementation_trail">
              <LazyImplementationTrail />
            </SmartFeatureGuard>
          </ProtectedSuspenseRoute>
        } 
      />

      {/* Comunidade */}
      <Route 
        path="/comunidade" 
        element={
          <ProtectedSuspenseRoute requireOnboarding={false} message="Carregando comunidade...">
            <LazyCommunityHome />
          </ProtectedSuspenseRoute>
        } 
      />
      <Route 
        path="/comunidade/topico/:topicId" 
        element={
          <ProtectedSuspenseRoute requireOnboarding={false} message="Carregando tópico...">
            <LazyTopicView />
          </ProtectedSuspenseRoute>
        } 
      />
      <Route 
        path="/comunidade/categoria/:slug" 
        element={
          <ProtectedSuspenseRoute requireOnboarding={false} message="Carregando categoria...">
            <LazyCategoryView />
          </ProtectedSuspenseRoute>
        } 
      />
      <Route 
        path="/comunidade/novo-topico/:categorySlug?" 
        element={
          <ProtectedSuspenseRoute requireOnboarding={false} message="Carregando formulário...">
            <LazyNewTopic />
          </ProtectedSuspenseRoute>
        } 
      />

      {/* Learning */}
      <Route 
        path="/learning" 
        element={
          <ProtectedSuspenseRoute requireOnboarding={false} message="Carregando cursos...">
            <LazyLearningPage />
          </ProtectedSuspenseRoute>
        } 
      />
      <Route 
        path="/learning/course/:id" 
        element={
          <ProtectedSuspenseRoute requireOnboarding={false} message="Carregando curso...">
            <LazyCourseDetails />
          </ProtectedSuspenseRoute>
        } 
      />
      <Route 
        path="/learning/lesson/:id" 
        element={
          <ProtectedSuspenseRoute requireOnboarding={false} message="Carregando aula...">
            <LazyLessonView />
          </ProtectedSuspenseRoute>
        } 
      />

      {/* Soluções */}
      <Route 
        path="/solutions" 
        element={
          <ProtectedSuspenseRoute message="Carregando soluções...">
            <LazySolutionsPage />
          </ProtectedSuspenseRoute>
        } 
      />
      <Route 
        path="/solutions/:id" 
        element={
          <ProtectedSuspenseRoute message="Carregando solução...">
            <LazySolutionDetails />
          </ProtectedSuspenseRoute>
        } 
      />
      <Route 
        path="/solutions/:id/implement" 
        element={
          <ProtectedSuspenseRoute message="Carregando implementação...">
            <LazySolutionImplementation />
          </ProtectedSuspenseRoute>
        } 
      />

      {/* Tools e Benefits */}
      <Route 
        path="/tools" 
        element={
          <ProtectedSuspenseRoute message="Carregando ferramentas...">
            <LazyToolsPage />
          </ProtectedSuspenseRoute>
        } 
      />
      <Route 
        path="/benefits" 
        element={
          <ProtectedSuspenseRoute message="Carregando benefícios...">
            <LazyBenefitsPage />
          </ProtectedSuspenseRoute>
        } 
      />
      <Route 
        path="/events" 
        element={
          <ProtectedSuspenseRoute message="Carregando eventos...">
            <LazyEventsPage />
          </ProtectedSuspenseRoute>
        } 
      />
      <Route 
        path="/suggestions" 
        element={
          <ProtectedSuspenseRoute message="Carregando sugestões...">
            <LazySuggestionsPage />
          </ProtectedSuspenseRoute>
        } 
      />

      {/* Networking */}
      <Route 
        path="/networking" 
        element={
          <ProtectedSuspenseRoute message="Carregando networking...">
            <SmartFeatureGuard feature="networking">
              <LazyNetworkingPage />
            </SmartFeatureGuard>
          </ProtectedSuspenseRoute>
        } 
      />

      {/* Onboarding */}
      <Route 
        path="/onboarding-new" 
        element={
          <ProtectedSuspenseRoute requireOnboarding={false} message="Carregando onboarding...">
            <LazyOnboardingFinalFlow />
          </ProtectedSuspenseRoute>
        } 
      />
      <Route 
        path="/onboarding-new/completed" 
        element={
          <ProtectedSuspenseRoute requireOnboarding={false} message="Carregando...">
            <LazyOnboardingCompleted />
          </ProtectedSuspenseRoute>
        } 
      />

      {/* Rotas Administrativas */}
      <Route 
        path="/admin" 
        element={
          <AdminProtectedRoutes>
            <Suspense fallback={<SuspenseFallback message="Carregando painel admin..." />}>
              <LazyAdminDashboard />
            </Suspense>
          </AdminProtectedRoutes>
        } 
      />
      <Route 
        path="/admin/analytics" 
        element={
          <AdminProtectedRoutes>
            <Suspense fallback={<SuspenseFallback message="Carregando analytics..." />}>
              <LazyAdminAnalytics />
            </Suspense>
          </AdminProtectedRoutes>
        } 
      />
      <Route 
        path="/admin/solutions" 
        element={
          <AdminProtectedRoutes>
            <Suspense fallback={<SuspenseFallback message="Carregando soluções admin..." />}>
              <LazyAdminSolutions />
            </Suspense>
          </AdminProtectedRoutes>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <AdminProtectedRoutes>
            <Suspense fallback={<SuspenseFallback message="Carregando usuários..." />}>
              <LazyAdminUsers />
            </Suspense>
          </AdminProtectedRoutes>
        } 
      />
      <Route 
        path="/admin/events" 
        element={
          <AdminProtectedRoutes>
            <Suspense fallback={<SuspenseFallback message="Carregando eventos admin..." />}>
              <LazyAdminEvents />
            </Suspense>
          </AdminProtectedRoutes>
        } 
      />

      {/* Rotas de Formação */}
      <Route 
        path="/formacao" 
        element={
          <FormacaoProtectedRoutes>
            <Suspense fallback={<SuspenseFallback message="Carregando formação..." />}>
              <LazyFormacaoDashboard />
            </Suspense>
          </FormacaoProtectedRoutes>
        } 
      />
      <Route 
        path="/formacao/cursos" 
        element={
          <FormacaoProtectedRoutes>
            <Suspense fallback={<SuspenseFallback message="Carregando cursos..." />}>
              <LazyFormacaoCursos />
            </Suspense>
          </FormacaoProtectedRoutes>
        } 
      />
      <Route 
        path="/formacao/aulas" 
        element={
          <FormacaoProtectedRoutes>
            <Suspense fallback={<SuspenseFallback message="Carregando aulas..." />}>
              <LazyFormacaoAulas />
            </Suspense>
          </FormacaoProtectedRoutes>
        } 
      />

      {/* Fallback 404 */}
      <Route 
        path="*" 
        element={
          <Suspense fallback={<SuspenseFallback message="Carregando..." />}>
            <LazyNotFound />
          </Suspense>
        } 
      />
    </Routes>
  );
};

export default AppRoutes;
