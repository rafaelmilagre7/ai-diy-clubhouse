
import { RouteObject } from "react-router-dom";
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import MemberLayout from '@/components/layout/MemberLayout';
import RootRedirect from '@/components/routing/RootRedirect';

// Member pages
import Dashboard from '@/pages/member/Dashboard';
import Solutions from '@/pages/member/Solutions';
import Tools from '@/pages/member/Tools';
import ToolDetails from '@/pages/member/ToolDetails';
import Profile from '@/pages/member/Profile';
import EditProfile from '@/pages/member/EditProfile';
import SolutionDetails from '@/pages/member/SolutionDetails';
import SolutionImplementation from '@/pages/member/SolutionImplementation';
import ImplementationCompleted from '@/pages/member/ImplementationCompleted';
import ImplementationTrail from '@/pages/member/ImplementationTrail';
import Benefits from '@/pages/member/Benefits';
import Suggestions from '@/pages/member/Suggestions';
import SuggestionDetails from '@/pages/member/SuggestionDetails';
import NewSuggestion from '@/pages/member/NewSuggestion';
import Events from '@/pages/member/Events';
import SolutionCertificate from '@/pages/member/SolutionCertificate';
import NotificationSettingsPage from '@/pages/profile/NotificationSettingsPage';

// Member Learning pages
import LearningPage from '@/pages/member/learning/LearningPage';
import CourseDetails from '@/pages/member/learning/CourseDetails';
import LessonView from '@/pages/member/learning/LessonView';
import MemberCertificates from '@/pages/member/learning/MemberCertificates';

// Member Community pages
import CommunityHome from '@/pages/member/community/CommunityHome';
import TopicView from '@/pages/member/community/TopicView';
import CategoryView from '@/pages/member/community/CategoryView';
import NewTopic from '@/pages/member/community/NewTopic';

// Função helper para criar rotas protegidas com MemberLayout
const createProtectedRoute = (path: string, Component: React.ComponentType<any>) => ({
  path,
  element: <ProtectedRoutes><MemberLayout><Component /></MemberLayout></ProtectedRoutes>
});

// Componente de redirecionamento para rotas da comunidade
const CommunityRedirect = () => {
  const { useNavigate } = require('react-router-dom');
  const navigate = useNavigate();
  
  React.useEffect(() => {
    navigate('/comunidade', { replace: true });
  }, [navigate]);
  
  return null;
};

// Log para diagnóstico
console.log("Carregando rotas de membros com correções aplicadas");

export const memberRoutes: RouteObject[] = [
  // Rota raiz
  { 
    path: "/", 
    element: <RootRedirect />
  },
  createProtectedRoute("/dashboard", Dashboard),
  
  createProtectedRoute("/solutions", Solutions),
  createProtectedRoute("/trilha-implementacao", ImplementationTrail),
  createProtectedRoute("/tools", Tools),
  createProtectedRoute("/tools/:id", ToolDetails),
  createProtectedRoute("/profile", Profile),
  createProtectedRoute("/profile/edit", EditProfile),
  createProtectedRoute("/settings/notifications", NotificationSettingsPage),
  createProtectedRoute("/solution/:id", SolutionDetails),
  createProtectedRoute("/solution/:id/certificate", SolutionCertificate),
  createProtectedRoute("/implement/:id/:moduleIdx", SolutionImplementation),
  createProtectedRoute("/implementation/:id", SolutionImplementation),
  createProtectedRoute("/implementation/:id/:moduleIdx", SolutionImplementation),
  createProtectedRoute("/implementation/completed/:id", ImplementationCompleted),
  createProtectedRoute("/benefits", Benefits),
  createProtectedRoute("/events", Events),
  
  // Learning/LMS Routes
  createProtectedRoute("/learning", LearningPage),
  createProtectedRoute("/learning/course/:id", CourseDetails),
  createProtectedRoute("/learning/course/:courseId/lesson/:lessonId", LessonView),
  createProtectedRoute("/learning/certificates", MemberCertificates),
  
  // Redirecionamento de /courses para /learning
  {
    path: "/courses",
    element: <ProtectedRoutes><MemberLayout><LearningPage /></MemberLayout></ProtectedRoutes>
  },
  
  // Sugestões Routes
  createProtectedRoute("/suggestions", Suggestions),
  createProtectedRoute("/suggestions/:id", SuggestionDetails),
  createProtectedRoute("/suggestions/new", NewSuggestion),
  
  // Comunidade Routes (principais - portugueses)
  createProtectedRoute("/comunidade", CommunityHome),
  createProtectedRoute("/comunidade/topico/:topicId", TopicView),
  createProtectedRoute("/comunidade/categoria/:slug", CategoryView),
  createProtectedRoute("/comunidade/novo-topico/:categorySlug", NewTopic),
  
  // Comunidade Routes (redirecionamentos inglês -> português)
  createProtectedRoute("/community", CommunityHome),
  createProtectedRoute("/community/topic/:topicId", TopicView),
  createProtectedRoute("/community/category/:slug", CategoryView),
  createProtectedRoute("/community/new-topic/:categorySlug", NewTopic),
];
