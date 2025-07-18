
import { RouteObject } from "react-router-dom";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { OnboardingGuard } from "@/components/guards/OnboardingGuard";
import MemberLayout from "@/components/layout/member/MemberLayout";

// Dashboard e navegação principal
import Dashboard from "@/pages/member/Dashboard";

// Soluções e implementação
import SolutionsList from "@/pages/member/SolutionsList";
import SolutionDetails from "@/pages/member/SolutionDetails";
import SolutionImplementation from "@/pages/member/SolutionImplementation";
import SolutionCertificate from "@/pages/member/SolutionCertificate";

// Comunidade e fórum
import CommunityPage from "@/pages/member/CommunityPage";
import ForumTopicDetail from "@/pages/member/ForumTopicDetail";

// Formação e cursos
import FormacaoPage from "@/pages/member/FormacaoPage";
import CourseDetails from "@/pages/member/CourseDetails";
import LessonPage from "@/pages/member/LessonPage";

// Perfil e configurações
import ProfilePage from "@/pages/member/ProfilePage";
import MemberSettings from "@/pages/member/MemberSettings";

// Mensagens e conexões
import MessagesPage from "@/pages/member/MessagesPage";
import ConversationPage from "@/pages/member/ConversationPage";

// Sugestões
import SuggestionsPage from "@/pages/member/SuggestionsPage";
import SuggestionDetailsPage from "@/pages/member/SuggestionDetailsPage";

export const memberRoutes: RouteObject[] = [
  {
    path: "/",
    element: (
      <AuthGuard>
        <OnboardingGuard>
          <MemberLayout />
        </OnboardingGuard>
      </AuthGuard>
    ),
    children: [
      // Dashboard principal
      { path: "/", element: <Dashboard /> },
      { path: "/dashboard", element: <Dashboard /> },

      // Soluções - rotas corrigidas
      { path: "/solutions", element: <SolutionsList /> },
      { path: "/solutions/:id", element: <SolutionDetails /> },
      { path: "/solutions/:id/implementation", element: <SolutionImplementation /> },
      { path: "/solutions/:id/implementation/:moduleIdx", element: <SolutionImplementation /> },
      { path: "/solutions/:id/certificate", element: <SolutionCertificate /> },

      // Manter compatibilidade com rotas antigas (redirecionamento)
      { path: "/solution/:id", element: <SolutionDetails /> },
      { path: "/implement/:id/:moduleIdx", element: <SolutionImplementation /> },

      // Comunidade e fórum
      { path: "/comunidade", element: <CommunityPage /> },
      { path: "/comunidade/topico/:id", element: <ForumTopicDetail /> },

      // Formação e educação
      { path: "/formacao", element: <FormacaoPage /> },
      { path: "/formacao/curso/:id", element: <CourseDetails /> },
      { path: "/formacao/curso/:courseId/aula/:lessonId", element: <LessonPage /> },

      // Mensagens e conexões
      { path: "/mensagens", element: <MessagesPage /> },
      { path: "/mensagens/:conversationId", element: <ConversationPage /> },

      // Sugestões
      { path: "/suggestions", element: <SuggestionsPage /> },
      { path: "/suggestions/:id", element: <SuggestionDetailsPage /> },

      // Perfil e configurações
      { path: "/perfil", element: <ProfilePage /> },
      { path: "/perfil/:userId", element: <ProfilePage /> },
      { path: "/configuracoes", element: <MemberSettings /> },
    ],
  },
];
