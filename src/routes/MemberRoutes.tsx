
import { RouteObject } from "react-router-dom";
import ProtectedRouteWithChildren from '@/components/auth/ProtectedRouteWithChildren';
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

export const memberRoutes: RouteObject[] = [
  {
    path: "/",
    element: <ProtectedRouteWithChildren><MemberLayout><Dashboard /></MemberLayout></ProtectedRouteWithChildren>
  },
  {
    path: "/dashboard",
    element: <ProtectedRouteWithChildren><MemberLayout><Dashboard /></MemberLayout></ProtectedRouteWithChildren>
  },
  {
    path: "/implementation-trail",
    element: <ProtectedRouteWithChildren><MemberLayout><ImplementationTrailPage /></MemberLayout></ProtectedRouteWithChildren>
  },
  {
    path: "/solutions",
    element: <ProtectedRouteWithChildren><MemberLayout><Solutions /></MemberLayout></ProtectedRouteWithChildren>
  },
  {
    path: "/tools",
    element: <ProtectedRouteWithChildren><MemberLayout><Tools /></MemberLayout></ProtectedRouteWithChildren>
  },
  {
    path: "/tools/:id",
    element: <ProtectedRouteWithChildren><MemberLayout><ToolDetails /></MemberLayout></ProtectedRouteWithChildren>
  },
  {
    path: "/profile",
    element: <ProtectedRouteWithChildren><MemberLayout><Profile /></MemberLayout></ProtectedRouteWithChildren>
  },
  {
    path: "/profile/edit",
    element: <ProtectedRouteWithChildren><MemberLayout><EditProfile /></MemberLayout></ProtectedRouteWithChildren>
  },
  {
    path: "/solution/:id",
    element: <ProtectedRouteWithChildren><MemberLayout><SolutionDetails /></MemberLayout></ProtectedRouteWithChildren>
  },
  {
    path: "/implement/:id/:moduleIdx",
    element: <ProtectedRouteWithChildren><MemberLayout><SolutionImplementation /></MemberLayout></ProtectedRouteWithChildren>
  },
  {
    path: "/implementation/:id",
    element: <ProtectedRouteWithChildren><MemberLayout><SolutionImplementation /></MemberLayout></ProtectedRouteWithChildren>
  },
  {
    path: "/implementation/:id/:moduleIdx",
    element: <ProtectedRouteWithChildren><MemberLayout><SolutionImplementation /></MemberLayout></ProtectedRouteWithChildren>
  },
  {
    path: "/implementation/completed/:id",
    element: <ProtectedRouteWithChildren><MemberLayout><ImplementationCompleted /></MemberLayout></ProtectedRouteWithChildren>
  },
  {
    path: "/benefits",
    element: <ProtectedRouteWithChildren><MemberLayout><Benefits /></MemberLayout></ProtectedRouteWithChildren>
  },
  {
    path: "/events",
    element: <ProtectedRouteWithChildren><MemberLayout><Events /></MemberLayout></ProtectedRouteWithChildren>
  },
  
  // Learning/LMS Routes para membro
  {
    path: "/learning",
    element: <ProtectedRouteWithChildren><MemberLayout><LearningPage /></MemberLayout></ProtectedRouteWithChildren>
  },
  {
    path: "/learning/course/:id",
    element: <ProtectedRouteWithChildren><MemberLayout><CourseDetails /></MemberLayout></ProtectedRouteWithChildren>
  },
  {
    path: "/learning/course/:courseId/lesson/:lessonId",
    element: <ProtectedRouteWithChildren><MemberLayout><LessonView /></MemberLayout></ProtectedRouteWithChildren>
  },
  
  // Sugestões Routes
  {
    path: "/suggestions",
    element: <ProtectedRouteWithChildren><MemberLayout><Suggestions /></MemberLayout></ProtectedRouteWithChildren>
  },
  {
    path: "/suggestions/:id",
    element: <ProtectedRouteWithChildren><MemberLayout><SuggestionDetails /></MemberLayout></ProtectedRouteWithChildren>
  },
  {
    path: "/suggestions/new",
    element: <ProtectedRouteWithChildren><MemberLayout><NewSuggestion /></MemberLayout></ProtectedRouteWithChildren>
  },
];
