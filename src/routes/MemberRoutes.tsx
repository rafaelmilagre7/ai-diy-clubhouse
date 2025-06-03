
import { RouteObject } from "react-router-dom";
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import MemberLayout from '@/components/layout/MemberLayout';

// Member pages
import OptimizedDashboard from '@/pages/member/OptimizedDashboard';
import SolutionDetails from '@/pages/member/SolutionDetails';
import Solutions from '@/pages/member/Solutions';
import ImplementationTrailPage from '@/pages/member/ImplementationTrailPage';
import ProfilePage from '@/pages/member/ProfilePage';
import OnboardingPage from '@/pages/member/OnboardingPage';
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
  createMemberRoute("/solutions", Solutions),
  createMemberRoute("/solutions/:id", SolutionDetails),
  createMemberRoute("/implementation-trail", ImplementationTrailPage),
  createMemberRoute("/profile", ProfilePage),
  createMemberRoute("/onboarding", OnboardingPage),
  createMemberRoute("/suggestions", SuggestionsPage),
  createMemberRoute("/suggestions/new", NewSuggestionPage),
  createMemberRoute("/suggestions/:id", SuggestionDetails),
];
