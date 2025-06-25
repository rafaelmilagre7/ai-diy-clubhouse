
import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import Layout from "@/components/layout/Layout";
import { RouteProtection } from "@/components/routing/RouteProtection";
import { SmartRedirect } from "@/components/routing/SmartRedirect";

// Lazy loading das páginas de autenticação
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const SetNewPasswordPage = lazy(() => import("@/pages/auth/SetNewPasswordPage"));
const OnboardingPage = lazy(() => import("@/pages/auth/OnboardingPage"));

// Lazy loading das páginas dos membros
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const Profile = lazy(() => import("@/pages/member/Profile"));
const SolutionImplementation = lazy(() => import("@/pages/member/SolutionImplementation"));
const SolutionDetails = lazy(() => import("@/pages/member/SolutionDetails"));
const Tools = lazy(() => import("@/pages/member/Tools"));
const ToolDetails = lazy(() => import("@/pages/member/ToolDetails"));
const LearningPage = lazy(() => import("@/pages/member/learning/LearningPage"));
const CourseDetails = lazy(() => import("@/pages/member/learning/CourseDetails"));
const LessonView = lazy(() => import("@/pages/member/learning/LessonView"));
const ImplementationTrail = lazy(() => import("@/pages/member/ImplementationTrail"));
const Suggestions = lazy(() => import("@/pages/member/Suggestions"));
const SuggestionDetail = lazy(() => import("@/pages/member/SuggestionDetail"));
const Events = lazy(() => import("@/pages/member/Events"));
const Benefits = lazy(() => import("@/pages/member/Benefits"));
const LearningCertificates = lazy(() => import("@/pages/member/LearningCertificates"));

// Lazy loading das páginas administrativas
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminSolutions = lazy(() => import("@/pages/admin/AdminSolutions"));
const AdminSolutionCreate = lazy(() => import("@/pages/admin/AdminSolutionCreate"));
const AdminSolutionEdit = lazy(() => import("@/pages/admin/AdminSolutionEdit"));
const AdminTools = lazy(() => import("@/pages/admin/AdminTools"));
const AdminToolEdit = lazy(() => import("@/pages/admin/AdminToolEdit"));
const AdminSuggestions = lazy(() => import("@/pages/admin/AdminSuggestions"));
const AdminEvents = lazy(() => import("@/pages/admin/AdminEvents"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));
const AdminSecurity = lazy(() => import("@/pages/admin/AdminSecurity"));
const AdminInvites = lazy(() => import("@/pages/admin/AdminInvites"));

// Lazy loading das páginas de formação
const FormacaoDashboard = lazy(() => import("@/pages/formacao/FormacaoDashboard"));
const FormacaoAulas = lazy(() => import("@/pages/formacao/FormacaoAulas"));

export const AppRoutes = createBrowserRouter([
  // Rota raiz com redirecionamento inteligente
  {
    path: "/",
    element: <SmartRedirect />
  },

  // Rotas de autenticação (públicas)
  {
    path: "/login",
    element: (
      <RouteProtection level="public">
        <LoginPage />
      </RouteProtection>
    )
  },
  {
    path: "/register",
    element: (
      <RouteProtection level="public">
        <RegisterPage />
      </RouteProtection>
    )
  },
  {
    path: "/reset-password",
    element: (
      <RouteProtection level="public">
        <ResetPasswordPage />
      </RouteProtection>
    )
  },
  {
    path: "/set-new-password",
    element: (
      <RouteProtection level="public">
        <SetNewPasswordPage />
      </RouteProtection>
    )
  },
  {
    path: "/onboarding",
    element: (
      <RouteProtection level="authenticated">
        <OnboardingPage />
      </RouteProtection>
    )
  },

  // Rotas de membros (autenticadas)
  {
    path: "/dashboard",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <DashboardPage />
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/profile",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <Profile />
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/solutions/:id/implementation",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <SolutionImplementation />
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/solutions/:id",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <SolutionDetails />
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/tools",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <Tools />
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/tools/:id",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <ToolDetails />
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/learning",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <LearningPage />
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/learning/courses/:id",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <CourseDetails />
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/learning/courses/:courseId/lessons/:lessonId",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <LessonView />
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/implementation-trail",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <ImplementationTrail />
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/suggestions",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <Suggestions />
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/suggestions/:id",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <SuggestionDetail />
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/events",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <Events />
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/benefits",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <Benefits />
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/certificates",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <LearningCertificates />
        </Layout>
      </RouteProtection>
    )
  },

  // Rotas administrativas
  {
    path: "/admin",
    element: (
      <RouteProtection level="admin">
        <AdminDashboard />
      </RouteProtection>
    )
  },
  {
    path: "/admin/users",
    element: (
      <RouteProtection level="admin">
        <AdminUsers />
      </RouteProtection>
    )
  },
  {
    path: "/admin/solutions",
    element: (
      <RouteProtection level="admin">
        <AdminSolutions />
      </RouteProtection>
    )
  },
  {
    path: "/admin/solutions/create",
    element: (
      <RouteProtection level="admin">
        <AdminSolutionCreate />
      </RouteProtection>
    )
  },
  {
    path: "/admin/solutions/:id/edit",
    element: (
      <RouteProtection level="admin">
        <AdminSolutionEdit />
      </RouteProtection>
    )
  },
  {
    path: "/admin/tools",
    element: (
      <RouteProtection level="admin">
        <AdminTools />
      </RouteProtection>
    )
  },
  {
    path: "/admin/tools/:id/edit",
    element: (
      <RouteProtection level="admin">
        <AdminToolEdit />
      </RouteProtection>
    )
  },
  {
    path: "/admin/suggestions",
    element: (
      <RouteProtection level="admin">
        <AdminSuggestions />
      </RouteProtection>
    )
  },
  {
    path: "/admin/events",
    element: (
      <RouteProtection level="admin">
        <AdminEvents />
      </RouteProtection>
    )
  },
  {
    path: "/admin/analytics",
    element: (
      <RouteProtection level="admin">
        <AdminAnalytics />
      </RouteProtection>
    )
  },
  {
    path: "/admin/security",
    element: (
      <RouteProtection level="admin">
        <AdminSecurity />
      </RouteProtection>
    )
  },
  {
    path: "/admin/invites",
    element: (
      <RouteProtection level="admin">
        <AdminInvites />
      </RouteProtection>
    )
  },

  // Rotas de formação
  {
    path: "/formacao",
    element: (
      <RouteProtection level="formacao">
        <FormacaoDashboard />
      </RouteProtection>
    )
  },
  {
    path: "/formacao/aulas",
    element: (
      <RouteProtection level="formacao">
        <FormacaoAulas />
      </RouteProtection>
    )
  }
]);
