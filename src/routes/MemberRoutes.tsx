
import { RouteObject } from "react-router-dom";
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import MemberLayout from '@/components/layout/MemberLayout';
import { lazy } from 'react';

// Lazy load das páginas principais
const OptimizedDashboard = lazy(() => import('@/pages/member/OptimizedDashboard'));
const CommunityPage = lazy(() => import('@/pages/member/community/CommunityPage'));
const CategoryTopicsPage = lazy(() => import('@/pages/member/community/CategoryTopicsPage'));
const TopicPage = lazy(() => import('@/pages/member/community/TopicPage'));
const NewTopicPage = lazy(() => import('@/pages/member/community/NewTopicPage'));
const NetworkingPage = lazy(() => import('@/pages/member/networking/NetworkingPage'));
const MatchesPage = lazy(() => import('@/pages/member/networking/MatchesPage'));
const ConnectionsPage = lazy(() => import('@/pages/member/networking/ConnectionsPage'));
const SolutionsPage = lazy(() => import('@/pages/member/solutions/SolutionsPage'));
const SolutionDetailsPage = lazy(() => import('@/pages/member/solutions/SolutionDetailsPage'));
const ImplementationPage = lazy(() => import('@/pages/member/solutions/ImplementationPage'));
const LearningPage = lazy(() => import('@/pages/member/learning/LearningPage'));
const CourseDetailsWithAccess = lazy(() => import('@/pages/member/learning/CourseDetailsWithAccess'));
const LessonPage = lazy(() => import('@/pages/member/learning/LessonPage'));
const ToolsPage = lazy(() => import('@/pages/member/tools/ToolsPage'));
const ToolDetailsPage = lazy(() => import('@/pages/member/tools/ToolDetailsPage'));
const ProfilePage = lazy(() => import('@/pages/member/profile/ProfilePage'));
const ProfileEditPage = lazy(() => import('@/pages/member/profile/ProfileEditPage'));
const OnboardingNew = lazy(() => import('@/pages/onboarding/OnboardingNew'));
const ImplementationTrailPage = lazy(() => import('@/pages/member/ImplementationTrailPage'));

// Função helper para criar rotas protegidas com MemberLayout
const createMemberRoute = (path: string, Component: React.ComponentType<any>) => ({
  path,
  element: <ProtectedRoutes><MemberLayout><Component /></MemberLayout></ProtectedRoutes>
});

export const memberRoutes: RouteObject[] = [
  createMemberRoute("/", OptimizedDashboard),
  createMemberRoute("/dashboard", OptimizedDashboard),
  
  // Comunidade
  createMemberRoute("/comunidade", CommunityPage),
  createMemberRoute("/comunidade/categoria/:slug", CategoryTopicsPage),
  createMemberRoute("/comunidade/topico/:topicId", TopicPage),
  createMemberRoute("/comunidade/novo-topico/:categorySlug", NewTopicPage),
  
  // Networking
  createMemberRoute("/networking", NetworkingPage),
  createMemberRoute("/networking/matches", MatchesPage),
  createMemberRoute("/networking/connections", ConnectionsPage),
  
  // Soluções
  createMemberRoute("/solutions", SolutionsPage),
  createMemberRoute("/solutions/:id", SolutionDetailsPage),
  createMemberRoute("/solutions/:id/implementation", ImplementationPage),
  
  // Learning - usando o novo componente com verificação de acesso
  createMemberRoute("/learning", LearningPage),
  createMemberRoute("/learning/courses/:id", CourseDetailsWithAccess),
  createMemberRoute("/learning/lessons/:id", LessonPage),
  
  // Ferramentas
  createMemberRoute("/tools", ToolsPage),
  createMemberRoute("/tools/:id", ToolDetailsPage),
  
  // Perfil
  createMemberRoute("/profile", ProfilePage),
  createMemberRoute("/profile/edit", ProfileEditPage),
  
  // Onboarding
  createMemberRoute("/onboarding-new", OnboardingNew),
  
  // Trilha de Implementação
  createMemberRoute("/implementation-trail", ImplementationTrailPage),
];
