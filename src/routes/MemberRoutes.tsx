
import { RouteObject } from "react-router-dom";
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import { SmartFeatureGuard } from '@/components/auth/SmartFeatureGuard';
import MemberLayout from '@/components/layout/MemberLayout';
import ProfileRoutes from './ProfileRoutes';

// Páginas críticas - carregamento imediato
import OptimizedDashboard from '@/pages/member/OptimizedDashboard';
import Solutions from '@/pages/member/Solutions';
import Tools from '@/pages/member/Tools';
import ToolDetails from '@/pages/member/ToolDetails';
import SolutionDetails from '@/pages/member/SolutionDetails';
import SolutionImplementation from '@/pages/member/SolutionImplementation';
import ImplementationCompleted from '@/pages/member/ImplementationCompleted';
import ImplementationTrailPage from '@/pages/member/ImplementationTrailPage';

// Páginas com lazy loading
import {
  LazyEventsWithSuspense,
  LazyBenefitsWithSuspense,
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

// Networking components com lazy loading
import { ConnectionsManager } from '@/components/networking/ConnectionsManager';

// Função helper para criar rotas protegidas com MemberLayout
const createProtectedRoute = (path: string, Component: React.ComponentType<any>, featureGuard?: string) => ({
  path,
  element: (
    <ProtectedRoutes>
      <MemberLayout>
        {featureGuard ? (
          <SmartFeatureGuard feature={featureGuard}>
            <Component />
          </SmartFeatureGuard>
        ) : (
          <Component />
        )}
      </MemberLayout>
    </ProtectedRoutes>
  )
});

export const memberRoutes: RouteObject[] = [
  // Rotas críticas - carregamento imediato
  createProtectedRoute("/", OptimizedDashboard),
  createProtectedRoute("/dashboard", OptimizedDashboard),
  createProtectedRoute("/implementation-trail", ImplementationTrailPage, "implementation_trail"),
  createProtectedRoute("/solutions", Solutions),
  createProtectedRoute("/tools", Tools),
  createProtectedRoute("/tools/:id", ToolDetails),
  createProtectedRoute("/solution/:id", SolutionDetails),
  createProtectedRoute("/implement/:id/:moduleIdx", SolutionImplementation),
  createProtectedRoute("/implementation/:id", SolutionImplementation),
  createProtectedRoute("/implementation/:id/:moduleIdx", SolutionImplementation),
  createProtectedRoute("/implementation/completed/:id", ImplementationCompleted),
  
  // Rotas com lazy loading
  createProtectedRoute("/benefits", LazyBenefitsWithSuspense),
  createProtectedRoute("/events", LazyEventsWithSuspense),
  
  // Profile Routes - integração das rotas do perfil
  {
    path: "/profile/*",
    element: (
      <ProtectedRoutes>
        <MemberLayout>
          <ProfileRoutes />
        </MemberLayout>
      </ProtectedRoutes>
    )
  },
  
  // Learning/LMS Routes - com lazy loading
  createProtectedRoute("/learning", LazyLearningPageWithSuspense),
  createProtectedRoute("/learning/course/:id", LazyCourseDetailsWithSuspense),
  createProtectedRoute("/learning/course/:courseId/lesson/:lessonId", LazyLessonViewWithSuspense),
  
  // Sugestões Routes - com lazy loading
  createProtectedRoute("/suggestions", LazySuggestionsWithSuspense),
  createProtectedRoute("/suggestions/:id", LazySuggestionDetailsWithSuspense),
  createProtectedRoute("/suggestions/new", LazyNewSuggestionWithSuspense),
  
  // Comunidade Routes - com lazy loading
  createProtectedRoute("/comunidade", LazyCommunityHomeWithSuspense),
  createProtectedRoute("/comunidade/topico/:topicId", LazyTopicViewWithSuspense),
  createProtectedRoute("/comunidade/categoria/:slug", LazyCategoryViewWithSuspense),
  createProtectedRoute("/comunidade/novo-topico/:categorySlug", LazyNewTopicWithSuspense),
  
  // Networking Routes - com lazy loading e guard de feature
  createProtectedRoute("/networking", LazyNetworkingPageWithSuspense, "networking"),
  createProtectedRoute("/networking/connections", () => <ConnectionsManager />, "networking")
];
