import { RouteObject } from "react-router-dom";
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import MemberLayout from '@/components/layout/MemberLayout';
import RootRedirect from '@/components/routing/RootRedirect';

// Member pages
import Dashboard from '@/pages/member/Dashboard';
import Solutions from '@/pages/member/Solutions';
import Tools from '@/pages/member/Tools';
import ToolDetails from '@/pages/member/ToolDetails';
import ProfilePage from '@/pages/member/ProfilePage';
import EditProfile from '@/pages/member/EditProfile';
import SolutionDetails from '@/pages/member/SolutionDetails';
import SolutionImplementation from '@/pages/member/SolutionImplementation';
import ImplementationCompleted from '@/pages/member/ImplementationCompleted';
import ImplementationConfirmation from '@/pages/member/ImplementationConfirmation';
import ImplementationTrail from '@/pages/member/ImplementationTrail';
import Benefits from '@/pages/member/Benefits';
import Suggestions from '@/pages/member/Suggestions';
import SuggestionDetails from '@/pages/member/SuggestionDetails';
import NewSuggestion from '@/pages/member/NewSuggestion';
import Events from '@/pages/member/Events';
import SolutionCertificate from '@/pages/member/SolutionCertificate';
import Networking from '@/pages/member/Networking';

// Member Learning pages
import LearningPage from '@/pages/member/learning/LearningPage';
import CourseDetails from '@/pages/member/learning/CourseDetails';
import LessonView from '@/pages/member/learning/LessonView';
import LessonRedirect from '@/pages/member/learning/LessonRedirect';
import CertificatesPage from '@/pages/member/learning/CertificatesPage';

// Member Community pages - CORRIGIDA IMPORTAÇÃO
import CommunityHome from '@/pages/CommunityHome'; // Nova página unificada
import TopicView from '@/pages/member/community/TopicView';
import CategoryView from '@/pages/member/community/CategoryView';
import NewTopic from '@/pages/member/community/NewTopic';
import CategoryListPage from '@/pages/member/community/CategoryListPage';

// Profile pages
import NotificationSettingsPage from '@/pages/profile/NotificationSettingsPage';
import MasterDashboard from '@/pages/master-dashboard';

// Função helper para criar rotas protegidas com MemberLayout
const createProtectedRoute = (path: string, Component: React.ComponentType<any>) => ({
  path,
  element: <ProtectedRoutes><MemberLayout><Component /></MemberLayout></ProtectedRoutes>
});

// Log para diagnóstico
console.log("Carregando rotas de membros com RootRedirect corrigido");

export const memberRoutes: RouteObject[] = [
  // Rota raiz agora usa RootRedirect envolvido por ProtectedRoutes
  { 
    path: "/", 
    element: <ProtectedRoutes><RootRedirect /></ProtectedRoutes>
  },
  
  
  createProtectedRoute("/dashboard", Dashboard),
  
  createProtectedRoute("/solutions", Solutions),
  createProtectedRoute("/trilha-implementacao", ImplementationTrail),
  createProtectedRoute("/tools", Tools),
  createProtectedRoute("/tools/:id", ToolDetails),
  createProtectedRoute("/networking", Networking),
  createProtectedRoute("/profile", ProfilePage),
  createProtectedRoute("/profile/edit", EditProfile),
  createProtectedRoute("/profile/notifications", NotificationSettingsPage),
  createProtectedRoute("/solution/:id", SolutionDetails),
  createProtectedRoute("/solution/:id/confirmation", ImplementationConfirmation),
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
  createProtectedRoute("/learning/lesson/:lessonId", LessonRedirect),
  createProtectedRoute("/learning/course/:courseId/lesson/:lessonId", LessonView),
  createProtectedRoute("/learning/certificates", CertificatesPage),
  
  // Sugestões Routes
  createProtectedRoute("/suggestions", Suggestions),
  createProtectedRoute("/suggestions/:id", SuggestionDetails),
  createProtectedRoute("/suggestions/new", NewSuggestion),
  
  // Master Dashboard Route
  createProtectedRoute("/master-dashboard", MasterDashboard),
  
  // Comunidade Routes - CORRIGIDAS E AMPLIADAS
  createProtectedRoute("/comunidade", CommunityHome),
  createProtectedRoute("/comunidade/categorias", CategoryListPage),
  createProtectedRoute("/comunidade/topico/:topicId", TopicView),
  createProtectedRoute("/comunidade/categoria/:slug", CategoryView),
  createProtectedRoute("/comunidade/novo-topico/:categorySlug", NewTopic),
  createProtectedRoute("/comunidade/novo-topico", NewTopic),
  
];
