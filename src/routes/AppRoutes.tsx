
import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { RouteProtection } from "@/components/routing/RouteProtection";
import { SmartRedirect } from "@/components/routing/SmartRedirect";
import Layout from "@/components/layout/Layout";
import FormacaoLayout from "@/components/layout/formacao/FormacaoLayout";
import LoadingScreen from "@/components/common/LoadingScreen";

// Lazy load components
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const SetNewPasswordPage = lazy(() => import("@/pages/auth/SetNewPasswordPage"));
const OnboardingPage = lazy(() => import("@/pages/auth/OnboardingPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const ProfilePage = lazy(() => import("@/pages/member/Profile"));
const SolutionsPage = lazy(() => import("@/pages/member/Solutions"));
const SolutionDetailPage = lazy(() => import("@/pages/member/SolutionDetail"));
const ToolsPage = lazy(() => import("@/pages/member/Tools"));
const ToolDetailPage = lazy(() => import("@/pages/member/ToolDetail"));
const LearningPage = lazy(() => import("@/pages/member/Learning"));
const LearningCoursePage = lazy(() => import("@/pages/member/LearningCourse"));
const LearningLessonPage = lazy(() => import("@/pages/member/LearningLesson"));
const LearningCertificatesPage = lazy(() => import("@/pages/member/LearningCertificates"));
const SuggestionsPage = lazy(() => import("@/pages/member/Suggestions"));
const SuggestionDetailPage = lazy(() => import("@/pages/member/SuggestionDetail"));
const EventsPage = lazy(() => import("@/pages/member/Events"));
const BenefitsPage = lazy(() => import("@/pages/member/Benefits"));

// Admin pages
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminUserDetail = lazy(() => import("@/pages/admin/AdminUserDetail"));
const AdminInvites = lazy(() => import("@/pages/admin/AdminInvites"));
const AdminRoles = lazy(() => import("@/pages/admin/AdminRoles"));
const AdminTools = lazy(() => import("@/pages/admin/AdminTools"));
const AdminSolutions = lazy(() => import("@/pages/admin/AdminSolutions"));
const AdminSolutionEditor = lazy(() => import("@/pages/admin/AdminSolutionEditor"));
const AdminEvents = lazy(() => import("@/pages/admin/AdminEvents"));
const AdminSuggestions = lazy(() => import("@/pages/admin/AdminSuggestions"));
const AdminSuggestionDetail = lazy(() => import("@/pages/admin/AdminSuggestionDetail"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));
const AdminBenefits = lazy(() => import("@/pages/admin/AdminBenefits"));
const AdminCommunications = lazy(() => import("@/pages/admin/AdminCommunications"));
const AdminSecurity = lazy(() => import("@/pages/admin/AdminSecurity"));

// Formacao pages
const FormacaoDashboard = lazy(() => import("@/pages/formacao/FormacaoDashboard"));
const FormacaoCursos = lazy(() => import("@/pages/formacao/FormacaoCursos"));
const FormacaoAulas = lazy(() => import("@/pages/formacao/FormacaoAulas"));
const FormacaoNovaAula = lazy(() => import("@/pages/formacao/FormacaoNovaAula"));
const FormacaoMateriais = lazy(() => import("@/pages/formacao/FormacaoMateriais"));
const FormacaoConfiguracoes = lazy(() => import("@/pages/formacao/FormacaoConfiguracoes"));

// Component wrapper for suspense
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingScreen message="Carregando página..." />}>
    {children}
  </Suspense>
);

export const AppRoutes = createBrowserRouter([
  // Public routes
  {
    path: "/",
    element: <SmartRedirect />
  },
  {
    path: "/login",
    element: (
      <RouteProtection level="public">
        <SuspenseWrapper>
          <LoginPage />
        </SuspenseWrapper>
      </RouteProtection>
    )
  },
  {
    path: "/register",
    element: (
      <RouteProtection level="public">
        <SuspenseWrapper>
          <RegisterPage />
        </SuspenseWrapper>
      </RouteProtection>
    )
  },
  {
    path: "/reset-password",
    element: (
      <RouteProtection level="public">
        <SuspenseWrapper>
          <ResetPasswordPage />
        </SuspenseWrapper>
      </RouteProtection>
    )
  },
  {
    path: "/set-new-password",
    element: (
      <RouteProtection level="public">
        <SuspenseWrapper>
          <SetNewPasswordPage />
        </SuspenseWrapper>
      </RouteProtection>
    )
  },
  {
    path: "/onboarding",
    element: (
      <RouteProtection level="authenticated">
        <SuspenseWrapper>
          <OnboardingPage />
        </SuspenseWrapper>
      </RouteProtection>
    )
  },

  // Member routes with Layout
  {
    path: "/dashboard",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/profile",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <SuspenseWrapper>
            <ProfilePage />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/solutions",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <SuspenseWrapper>
            <SolutionsPage />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/solutions/:id",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <SuspenseWrapper>
            <SolutionDetailPage />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/tools",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <SuspenseWrapper>
            <ToolsPage />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/tools/:id",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <SuspenseWrapper>
            <ToolDetailPage />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/learning",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <SuspenseWrapper>
            <LearningPage />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/learning/courses/:id",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <SuspenseWrapper>
            <LearningCoursePage />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/learning/lessons/:id",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <SuspenseWrapper>
            <LearningLessonPage />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/learning/certificates",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <SuspenseWrapper>
            <LearningCertificatesPage />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/suggestions",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <SuspenseWrapper>
            <SuggestionsPage />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/suggestions/:id",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <SuspenseWrapper>
            <SuggestionDetailPage />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/events",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <SuspenseWrapper>
            <EventsPage />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/benefits",
    element: (
      <RouteProtection level="authenticated">
        <Layout>
          <SuspenseWrapper>
            <BenefitsPage />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },

  // Admin routes
  {
    path: "/admin",
    element: (
      <RouteProtection level="admin">
        <Layout>
          <SuspenseWrapper>
            <AdminDashboard />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/admin/users",
    element: (
      <RouteProtection level="admin">
        <Layout>
          <SuspenseWrapper>
            <AdminUsers />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/admin/users/:id",
    element: (
      <RouteProtection level="admin">
        <Layout>
          <SuspenseWrapper>
            <AdminUserDetail />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/admin/invites",
    element: (
      <RouteProtection level="admin">
        <Layout>
          <SuspenseWrapper>
            <AdminInvites />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/admin/roles",
    element: (
      <RouteProtection level="admin">
        <Layout>
          <SuspenseWrapper>
            <AdminRoles />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/admin/tools",
    element: (
      <RouteProtection level="admin">
        <Layout>
          <SuspenseWrapper>
            <AdminTools />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/admin/solutions",
    element: (
      <RouteProtection level="admin">
        <Layout>
          <SuspenseWrapper>
            <AdminSolutions />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/admin/solutions/:id",
    element: (
      <RouteProtection level="admin">
        <Layout>
          <SuspenseWrapper>
            <AdminSolutionEditor />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/admin/events",
    element: (
      <RouteProtection level="admin">
        <Layout>
          <SuspenseWrapper>
            <AdminEvents />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/admin/suggestions",
    element: (
      <RouteProtection level="admin">
        <Layout>
          <SuspenseWrapper>
            <AdminSuggestions />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/admin/suggestions/:id",
    element: (
      <RouteProtection level="admin">
        <Layout>
          <SuspenseWrapper>
            <AdminSuggestionDetail />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/admin/analytics",
    element: (
      <RouteProtection level="admin">
        <Layout>
          <SuspenseWrapper>
            <AdminAnalytics />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/admin/benefits",
    element: (
      <RouteProtection level="admin">
        <Layout>
          <SuspenseWrapper>
            <AdminBenefits />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/admin/communications",
    element: (
      <RouteProtection level="admin">
        <Layout>
          <SuspenseWrapper>
            <AdminCommunications />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },
  {
    path: "/admin/security",
    element: (
      <RouteProtection level="admin">
        <Layout>
          <SuspenseWrapper>
            <AdminSecurity />
          </SuspenseWrapper>
        </Layout>
      </RouteProtection>
    )
  },

  // Formacao routes
  {
    path: "/formacao",
    element: (
      <RouteProtection level="formacao">
        <FormacaoLayout>
          <SuspenseWrapper>
            <FormacaoDashboard />
          </SuspenseWrapper>
        </FormacaoLayout>
      </RouteProtection>
    )
  },
  {
    path: "/formacao/cursos",
    element: (
      <RouteProtection level="formacao">
        <FormacaoLayout>
          <SuspenseWrapper>
            <FormacaoCursos />
          </SuspenseWrapper>
        </FormacaoLayout>
      </RouteProtection>
    )
  },
  {
    path: "/formacao/aulas",
    element: (
      <RouteProtection level="formacao">
        <FormacaoLayout>
          <SuspenseWrapper>
            <FormacaoAulas />
          </SuspenseWrapper>
        </FormacaoLayout>
      </RouteProtection>
    )
  },
  {
    path: "/formacao/aulas/nova",
    element: (
      <RouteProtection level="formacao">
        <FormacaoLayout>
          <SuspenseWrapper>
            <FormacaoNovaAula />
          </SuspenseWrapper>
        </FormacaoLayout>
      </RouteProtection>
    )
  },
  {
    path: "/formacao/materiais",
    element: (
      <RouteProtection level="formacao">
        <FormacaoLayout>
          <SuspenseWrapper>
            <FormacaoMateriais />
          </SuspenseWrapper>
        </FormacaoLayout>
      </RouteProtection>
    )
  },
  {
    path: "/formacao/configuracoes",
    element: (
      <RouteProtection level="formacao">
        <FormacaoLayout>
          <SuspenseWrapper>
            <FormacaoConfiguracoes />
          </SuspenseWrapper>
        </FormacaoLayout>
      </RouteProtection>
    )
  },

  // Catch all - redirect to smart redirect
  {
    path: "*",
    element: <SmartRedirect fallback="/dashboard" />
  }
]);
