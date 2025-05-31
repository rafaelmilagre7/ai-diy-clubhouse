
import { RouteObject } from "react-router-dom";
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import { SmartFeatureGuard } from '@/components/auth/SmartFeatureGuard';
import MemberLayout from '@/components/layout/MemberLayout';
import ProfileRoutes from './ProfileRoutes';

// Member pages
import Dashboard from '@/pages/member/Dashboard';
import Solutions from '@/pages/member/Solutions';
import Tools from '@/pages/member/Tools';
import ToolDetails from '@/pages/member/ToolDetails';
import SolutionDetails from '@/pages/member/SolutionDetails';
import SolutionImplementation from '@/pages/member/SolutionImplementation';
import ImplementationCompleted from '@/pages/member/ImplementationCompleted';
import Benefits from '@/pages/member/Benefits';
import Suggestions from '@/pages/member/Suggestions';
import SuggestionDetails from '@/pages/member/SuggestionDetails';
import NewSuggestion from '@/pages/member/NewSuggestion';
import Events from '@/pages/member/Events';
import ImplementationTrailPage from '@/pages/member/ImplementationTrailPage';

// Member Learning pages
import LearningPage from '@/pages/member/learning/LearningPage';
import CourseDetails from '@/pages/member/learning/CourseDetails';
import LessonView from '@/pages/member/learning/LessonView';

// Member Community pages
import CommunityHome from '@/pages/member/community/CommunityHome';
import TopicView from '@/pages/member/community/TopicView';
import CategoryView from '@/pages/member/community/CategoryView';
import NewTopic from '@/pages/member/community/NewTopic';

// Member Networking pages
import NetworkingPage from '@/pages/member/networking/NetworkingPage';
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
  createProtectedRoute("/", Dashboard),
  createProtectedRoute("/dashboard", Dashboard),
  createProtectedRoute("/implementation-trail", ImplementationTrailPage, "implementation_trail"),
  createProtectedRoute("/solutions", Solutions),
  createProtectedRoute("/tools", Tools),
  createProtectedRoute("/tools/:id", ToolDetails),
  createProtectedRoute("/solution/:id", SolutionDetails),
  createProtectedRoute("/implement/:id/:moduleIdx", SolutionImplementation),
  createProtectedRoute("/implementation/:id", SolutionImplementation),
  createProtectedRoute("/implementation/:id/:moduleIdx", SolutionImplementation),
  createProtectedRoute("/implementation/completed/:id", ImplementationCompleted),
  createProtectedRoute("/benefits", Benefits),
  createProtectedRoute("/events", Events),
  
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
  
  // Learning/LMS Routes - sem guard de feature
  createProtectedRoute("/learning", LearningPage),
  createProtectedRoute("/learning/course/:id", CourseDetails),
  createProtectedRoute("/learning/course/:courseId/lesson/:lessonId", LessonView),
  
  // Sugestões Routes
  createProtectedRoute("/suggestions", Suggestions),
  createProtectedRoute("/suggestions/:id", SuggestionDetails),
  createProtectedRoute("/suggestions/new", NewSuggestion),
  
  // Comunidade Routes - sem guard de feature
  createProtectedRoute("/comunidade", CommunityHome),
  createProtectedRoute("/comunidade/topico/:topicId", TopicView),
  createProtectedRoute("/comunidade/categoria/:slug", CategoryView),
  createProtectedRoute("/comunidade/novo-topico/:categorySlug", NewTopic),
  
  // Networking Routes - mantém guard de feature
  createProtectedRoute("/networking", NetworkingPage, "networking"),
  createProtectedRoute("/networking/connections", () => <ConnectionsManager />, "networking")
];
