
import { RouteObject } from "react-router-dom";
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';
import MemberLayout from '@/components/layout/MemberLayout';

// Importações lazy dos componentes - verificando se há problemas com ícones
import {
  LazyImplementationTrailWithSuspense,
  LazySolutionsWithSuspense,
  LazyToolsWithSuspense,
  LazyBenefitsWithSuspense,
  LazyEventsWithSuspense,
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

// Importações diretas para páginas críticas
import Dashboard from '@/pages/member/Dashboard';
import Profile from '@/pages/member/Profile';
import EditProfile from '@/pages/member/EditProfile';

export const memberRoutes: RouteObject[] = [
  // Dashboard principal
  {
    path: "/dashboard",
    element: <ProtectedRoute><MemberLayout><Dashboard /></MemberLayout></ProtectedRoute>
  },
  
  // Perfil do usuário
  {
    path: "/profile",
    element: <ProtectedRoute><MemberLayout><Profile /></MemberLayout></ProtectedRoute>
  },
  {
    path: "/profile/edit",
    element: <ProtectedRoute><MemberLayout><EditProfile /></MemberLayout></ProtectedRoute>
  },
  
  // Trilha de implementação
  {
    path: "/implementation-trail",
    element: <ProtectedRoute requireOnboarding><MemberLayout><LazyImplementationTrailWithSuspense /></MemberLayout></ProtectedRoute>
  },
  
  // Soluções
  {
    path: "/solutions",
    element: <ProtectedRoute requireOnboarding><MemberLayout><LazySolutionsWithSuspense /></MemberLayout></ProtectedRoute>
  },
  
  // Ferramentas
  {
    path: "/tools",
    element: <ProtectedRoute requireOnboarding><MemberLayout><LazyToolsWithSuspense /></MemberLayout></ProtectedRoute>
  },
  
  // Benefícios
  {
    path: "/benefits",
    element: <ProtectedRoute requireOnboarding><MemberLayout><LazyBenefitsWithSuspense /></MemberLayout></ProtectedRoute>
  },
  
  // Eventos
  {
    path: "/events",
    element: <ProtectedRoute requireOnboarding><MemberLayout><LazyEventsWithSuspense /></MemberLayout></ProtectedRoute>
  },
  
  // Sistema de sugestões
  {
    path: "/suggestions",
    element: <ProtectedRoute requireOnboarding><MemberLayout><LazySuggestionsWithSuspense /></MemberLayout></ProtectedRoute>
  },
  {
    path: "/suggestions/:id",
    element: <ProtectedRoute requireOnboarding><MemberLayout><LazySuggestionDetailsWithSuspense /></MemberLayout></ProtectedRoute>
  },
  {
    path: "/suggestions/new",
    element: <ProtectedRoute requireOnboarding><MemberLayout><LazyNewSuggestionWithSuspense /></MemberLayout></ProtectedRoute>
  },
  
  // Learning/Cursos (sem necessidade de onboarding)
  {
    path: "/learning",
    element: <ProtectedRoute><MemberLayout><LazyLearningPageWithSuspense /></MemberLayout></ProtectedRoute>
  },
  {
    path: "/learning/course/:id",
    element: <ProtectedRoute><MemberLayout><LazyCourseDetailsWithSuspense /></MemberLayout></ProtectedRoute>
  },
  {
    path: "/learning/lesson/:id",
    element: <ProtectedRoute><MemberLayout><LazyLessonViewWithSuspense /></MemberLayout></ProtectedRoute>
  },
  
  // Comunidade (sem necessidade de onboarding)
  {
    path: "/comunidade",
    element: <ProtectedRoute><MemberLayout><LazyCommunityHomeWithSuspense /></MemberLayout></ProtectedRoute>
  },
  {
    path: "/comunidade/topico/:topicId",
    element: <ProtectedRoute><MemberLayout><LazyTopicViewWithSuspense /></MemberLayout></ProtectedRoute>
  },
  {
    path: "/comunidade/categoria/:slug",
    element: <ProtectedRoute><MemberLayout><LazyCategoryViewWithSuspense /></MemberLayout></ProtectedRoute>
  },
  {
    path: "/comunidade/novo-topico/:categorySlug?",
    element: <ProtectedRoute><MemberLayout><LazyNewTopicWithSuspense /></MemberLayout></ProtectedRoute>
  },
  
  // Networking
  {
    path: "/networking",
    element: <ProtectedRoute requireOnboarding><MemberLayout><LazyNetworkingPageWithSuspense /></MemberLayout></ProtectedRoute>
  },
];
