import { RouteObject, Navigate } from "react-router-dom";
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
import NetworkingAnalytics from '@/pages/member/NetworkingAnalytics';

import TeamManagementPage from '@/pages/member/TeamManagementPage';

// Builder pages
import Builder from '@/pages/member/Builder';
import MyAISolutions from '@/pages/member/MyAISolutions';
import SolutionHistory from '@/pages/member/SolutionHistory';
import MiracleSolutionCover from '@/pages/member/MiracleSolutionCover';
import MiracleSolutionFramework from '@/pages/member/MiracleSolutionFramework';
import MiracleSolutionArchitecture from '@/pages/member/MiracleSolutionArchitecture';
import MiracleSolutionTools from '@/pages/member/MiracleSolutionTools';
import MiracleSolutionChecklist from '@/pages/member/MiracleSolutionChecklist';

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
import PublicProfile from '@/pages/PublicProfile';

// Profile pages
import NotificationSettingsPage from '@/pages/profile/NotificationSettingsPage';

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
  createProtectedRoute("/ferramentas/miracleai", Builder),
  createProtectedRoute("/ferramentas/miracleai/historico", SolutionHistory),
  createProtectedRoute("/ferramentas/miracleai/solution/:id", MiracleSolutionCover),
  createProtectedRoute("/ferramentas/miracleai/solution/:id/framework", MiracleSolutionFramework),
  createProtectedRoute("/ferramentas/miracleai/solution/:id/arquitetura", MiracleSolutionArchitecture),
  createProtectedRoute("/ferramentas/miracleai/solution/:id/ferramentas", MiracleSolutionTools),
  createProtectedRoute("/ferramentas/miracleai/solution/:id/checklist", MiracleSolutionChecklist),
  
  // Redirect old builder routes
  {
    path: "/ferramentas/builder",
    element: <Navigate to="/ferramentas/miracleai" replace />
  },
  {
    path: "/ferramentas/builder/historico",
    element: <Navigate to="/ferramentas/miracleai/historico" replace />
  },
  createProtectedRoute("/minhas-solucoes", MyAISolutions),
  createProtectedRoute("/networking", Networking),
    createProtectedRoute("/networking/analytics", NetworkingAnalytics),
  createProtectedRoute("/profile", ProfilePage),
  createProtectedRoute("/profile/edit", EditProfile),
  createProtectedRoute("/profile/notifications", NotificationSettingsPage),
  createProtectedRoute("/team-management", TeamManagementPage),
  
  // Redirect old master-dashboard to team-management
  {
    path: "/master-dashboard",
    element: <Navigate to="/team-management" replace />
  },
  {
    path: "/master-dashboard/*",
    element: <Navigate to="/team-management" replace />
  },
  
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
  
  // Comunidade Routes - CORRIGIDAS E AMPLIADAS
  createProtectedRoute("/comunidade", CommunityHome),
  createProtectedRoute("/comunidade/categorias", CategoryListPage),
  createProtectedRoute("/comunidade/topico/:topicId", TopicView),
  createProtectedRoute("/comunidade/categoria/:slug", CategoryView),
  createProtectedRoute("/comunidade/novo-topico/:categorySlug", NewTopic),
  createProtectedRoute("/comunidade/novo-topico", NewTopic),
  
  // Perfil Público
  createProtectedRoute("/perfil/:userId", PublicProfile),
  
];
