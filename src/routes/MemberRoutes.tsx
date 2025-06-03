
import { RouteObject } from "react-router-dom";
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import MemberLayout from '@/components/layout/MemberLayout';

// Member pages
import OptimizedDashboard from '@/pages/member/OptimizedDashboard';
import SolutionDetailsPage from '@/pages/member/SolutionDetailsPage';
import CommunityPage from '@/pages/member/CommunityPage';
import TopicDetailsPage from '@/pages/member/TopicDetailsPage';
import NewTopicPage from '@/pages/member/NewTopicPage';
import ImplementationTrailPage from '@/pages/member/ImplementationTrailPage';
import LearningCoursesPage from '@/pages/member/LearningCoursesPage';
import LearningCourseDetailsPage from '@/pages/member/LearningCourseDetailsPage';
import LearningLessonPage from '@/pages/member/LearningLessonPage';
import SolutionsPage from '@/pages/member/SolutionsPage';
import ToolsPage from '@/pages/member/ToolsPage';
import EventsPage from '@/pages/member/EventsPage';
import ProfilePage from '@/pages/member/ProfilePage';
import OnboardingPage from '@/pages/member/OnboardingPage';
import NetworkingPage from '@/pages/member/NetworkingPage';
import SuggestionsPage from '@/pages/member/Suggestions';
import NewSuggestionPage from '@/pages/member/NewSuggestion';
import SuggestionDetails from '@/pages/member/SuggestionDetails';

// Função helper para criar rotas protegidas com MemberLayout
const createMemberRoute = (path: string, Component: React.ComponentType<any>) => ({
  path,
  element: <ProtectedRoutes><MemberLayout><Component /></MemberLayout></ProtectedRoutes>
});

export const memberRoutes: RouteObject[] = [
  createMemberRoute("/dashboard", OptimizedDashboard),
  createMemberRoute("/solutions", SolutionsPage),
  createMemberRoute("/solutions/:id", SolutionDetailsPage),
  createMemberRoute("/comunidade", CommunityPage),
  createMemberRoute("/comunidade/categoria/:slug", CommunityPage),
  createMemberRoute("/comunidade/topico/:topicId", TopicDetailsPage),
  createMemberRoute("/comunidade/novo-topico", NewTopicPage),
  createMemberRoute("/comunidade/novo-topico/:categorySlug", NewTopicPage),
  createMemberRoute("/implementation-trail", ImplementationTrailPage),
  createMemberRoute("/learning", LearningCoursesPage),
  createMemberRoute("/learning/courses/:courseId", LearningCourseDetailsPage),
  createMemberRoute("/learning/lesson/:lessonId", LearningLessonPage),
  createMemberRoute("/tools", ToolsPage),
  createMemberRoute("/events", EventsPage),
  createMemberRoute("/profile", ProfilePage),
  createMemberRoute("/onboarding", OnboardingPage),
  createMemberRoute("/networking", NetworkingPage),
  createMemberRoute("/suggestions", SuggestionsPage),
  createMemberRoute("/suggestions/new", NewSuggestionPage),
  createMemberRoute("/suggestions/:id", SuggestionDetails),
];
