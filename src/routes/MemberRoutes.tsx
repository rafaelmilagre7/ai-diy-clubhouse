
import { RouteObject } from "react-router-dom";
import AuthenticatedRoute from '@/components/routing/AuthenticatedRoute';
import MemberLayout from '@/components/layout/MemberLayout';

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
import CommunityPages from '@/pages/member/community/index';

// Função helper para criar rotas protegidas com MemberLayout
const createProtectedRoute = (path: string, Component: React.ComponentType<any>) => ({
  path,
  element: <AuthenticatedRoute><MemberLayout><Component /></MemberLayout></AuthenticatedRoute>
});

// Log para diagnóstico
console.log("Carregando rotas de membros com ProtectedRoute unificado");

export const memberRoutes: RouteObject[] = [
  createProtectedRoute("/", Dashboard),
  createProtectedRoute("/dashboard", Dashboard),
  createProtectedRoute("/implementation-trail", ImplementationTrailPage),
  createProtectedRoute("/solutions", Solutions),
  createProtectedRoute("/tools", Tools),
  createProtectedRoute("/tools/:id", ToolDetails),
  createProtectedRoute("/profile", Profile),
  createProtectedRoute("/profile/edit", EditProfile),
  createProtectedRoute("/solution/:id", SolutionDetails),
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
  
  // Sugestões Routes
  createProtectedRoute("/suggestions", Suggestions),
  createProtectedRoute("/suggestions/:id", SuggestionDetails),
  createProtectedRoute("/suggestions/new", NewSuggestion),
  
  // Comunidade Routes - Configuração corrigida
  {
    path: "/comunidade/*",
    element: <AuthenticatedRoute><MemberLayout><CommunityPages /></MemberLayout></AuthenticatedRoute>
  }
];
