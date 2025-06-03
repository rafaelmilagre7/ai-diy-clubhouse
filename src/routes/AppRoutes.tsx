
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';
import { SimpleRedirectHandler } from '@/components/routing/SmartRedirectHandler';
import LoadingScreen from '@/components/common/LoadingScreen';

// Import direto das páginas críticas
import LoginPage from '@/pages/auth/LoginPage';
import Dashboard from '@/pages/member/Dashboard';
import Profile from '@/pages/member/Profile';
import EditProfile from '@/pages/member/EditProfile';
import NotFound from '@/pages/NotFound';
import InvitePage from '@/pages/InvitePage';

// Layout principal
import MemberLayout from '@/components/layout/MemberLayout';

// Lazy imports organizados
import {
  LazyImplementationTrailWithSuspense,
  LazySolutionsWithSuspense,
  LazyToolsWithSuspense,
  LazyBenefitsWithSuspense,
  LazyEventsWithSuspense,
  LazySuggestionsWithSuspense,
  LazySuggestionDetailsWithSuspense,
  LazyNewSuggestionWithSuspense,
  LazyLearningPageWithSuspense,
  LazyCourseDetailsWithSuspense,
  LazyLessonViewWithSuspense,
  LazyCommunityHomeWithSuspense,
  LazyTopicViewWithSuspense,
  LazyCategoryViewWithSuspense,
  LazyNewTopicWithSuspense,
  LazyNetworkingPageWithSuspense
} from '@/components/routing/LazyRoutes';

// Rotas de onboarding e admin lazy
const LazyOnboardingRoutes = React.lazy(() => import('./OnboardingRoutes').then(m => ({ default: m.OnboardingRoutes })));

const AppRoutes = () => {
  console.log('AppRoutes: Renderizando estrutura de rotas principal');

  return (
    <Routes>
      {/* ÚNICA rota raiz com redirecionamento controlado */}
      <Route 
        path="/" 
        element={<SimpleRedirectHandler />} 
      />
      
      {/* Rota de login pública */}
      <Route 
        path="/login" 
        element={<LoginPage />} 
      />
      
      {/* Rotas de convite */}
      <Route 
        path="/convite/:token" 
        element={<InvitePage />} 
      />
      <Route 
        path="/convite" 
        element={<InvitePage />} 
      />
      
      {/* Dashboard principal - sempre protegido */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <MemberLayout>
              <Dashboard />
            </MemberLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Perfil do usuário */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <MemberLayout>
              <Profile />
            </MemberLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/edit" 
        element={
          <ProtectedRoute>
            <MemberLayout>
              <EditProfile />
            </MemberLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Trilha de implementação */}
      <Route 
        path="/implementation-trail" 
        element={
          <ProtectedRoute requireOnboarding>
            <MemberLayout>
              <LazyImplementationTrailWithSuspense />
            </MemberLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Soluções */}
      <Route 
        path="/solutions" 
        element={
          <ProtectedRoute requireOnboarding>
            <MemberLayout>
              <LazySolutionsWithSuspense />
            </MemberLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Ferramentas */}
      <Route 
        path="/tools" 
        element={
          <ProtectedRoute requireOnboarding>
            <MemberLayout>
              <LazyToolsWithSuspense />
            </MemberLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Benefícios */}
      <Route 
        path="/benefits" 
        element={
          <ProtectedRoute requireOnboarding>
            <MemberLayout>
              <LazyBenefitsWithSuspense />
            </MemberLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Eventos */}
      <Route 
        path="/events" 
        element={
          <ProtectedRoute requireOnboarding>
            <MemberLayout>
              <LazyEventsWithSuspense />
            </MemberLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Sistema de sugestões */}
      <Route 
        path="/suggestions" 
        element={
          <ProtectedRoute requireOnboarding>
            <MemberLayout>
              <LazySuggestionsWithSuspense />
            </MemberLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/suggestions/:id" 
        element={
          <ProtectedRoute requireOnboarding>
            <MemberLayout>
              <LazySuggestionDetailsWithSuspense />
            </MemberLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/suggestions/new" 
        element={
          <ProtectedRoute requireOnboarding>
            <MemberLayout>
              <LazyNewSuggestionWithSuspense />
            </MemberLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Learning/Cursos (sem necessidade de onboarding) */}
      <Route 
        path="/learning" 
        element={
          <ProtectedRoute>
            <MemberLayout>
              <LazyLearningPageWithSuspense />
            </MemberLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/learning/course/:id" 
        element={
          <ProtectedRoute>
            <MemberLayout>
              <LazyCourseDetailsWithSuspense />
            </MemberLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/learning/lesson/:id" 
        element={
          <ProtectedRoute>
            <MemberLayout>
              <LazyLessonViewWithSuspense />
            </MemberLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Comunidade (sem necessidade de onboarding) */}
      <Route 
        path="/comunidade" 
        element={
          <ProtectedRoute>
            <MemberLayout>
              <LazyCommunityHomeWithSuspense />
            </MemberLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/comunidade/topico/:topicId" 
        element={
          <ProtectedRoute>
            <MemberLayout>
              <LazyTopicViewWithSuspense />
            </MemberLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/comunidade/categoria/:slug" 
        element={
          <ProtectedRoute>
            <MemberLayout>
              <LazyCategoryViewWithSuspense />
            </MemberLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/comunidade/novo-topico/:categorySlug?" 
        element={
          <ProtectedRoute>
            <MemberLayout>
              <LazyNewTopicWithSuspense />
            </MemberLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Networking */}
      <Route 
        path="/networking" 
        element={
          <ProtectedRoute requireOnboarding>
            <MemberLayout>
              <LazyNetworkingPageWithSuspense />
            </MemberLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Onboarding Routes */}
      <Route 
        path="/onboarding-new/*" 
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<LoadingScreen message="Carregando onboarding..." />}>
              <LazyOnboardingRoutes />
            </React.Suspense>
          </ProtectedRoute>
        } 
      />
      
      {/* Fallback unificado - redirecionar para dashboard */}
      <Route 
        path="*" 
        element={<Navigate to="/dashboard" replace />} 
      />
    </Routes>
  );
};

export default AppRoutes;
