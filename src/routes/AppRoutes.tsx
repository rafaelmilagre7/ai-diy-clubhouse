
import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import { RouteProtection } from "@/components/routing/RouteProtection";
import { SmartRedirect } from "@/components/routing/SmartRedirect";
import LoadingScreen from "@/components/common/LoadingScreen";

// Lazy load pages for better performance
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const SetNewPassword = lazy(() => import("@/pages/auth/SetNewPassword"));
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));

// Member Layout and Pages
const Layout = lazy(() => import("@/components/layout/Layout"));

// Admin Pages
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminTools = lazy(() => import("@/pages/admin/AdminTools"));
const AdminSolutions = lazy(() => import("@/pages/admin/AdminSolutions"));
const AdminAnalytics = lazy(() => import("@/pages/admin/AdminAnalytics"));
const AdminSuggestions = lazy(() => import("@/pages/admin/AdminSuggestions"));
const AdminSuggestionDetail = lazy(() => import("@/pages/admin/AdminSuggestionDetail"));
const AdminEvents = lazy(() => import("@/pages/admin/AdminEvents"));
const AdminRoles = lazy(() => import("@/pages/admin/AdminRoles"));
const AdminInvites = lazy(() => import("@/pages/admin/AdminInvites"));
const AdminCommunications = lazy(() => import("@/pages/admin/AdminCommunications"));
const AdminSecurity = lazy(() => import("@/pages/admin/AdminSecurity"));

// Formação/LMS Pages
const FormacaoDashboard = lazy(() => import("@/pages/formacao/FormacaoDashboard"));
const FormacaoCursos = lazy(() => import("@/pages/formacao/FormacaoCursos"));
const FormacaoAulas = lazy(() => import("@/pages/formacao/FormacaoAulas"));
const FormacaoNovaAula = lazy(() => import("@/pages/formacao/FormacaoNovaAula"));
const FormacaoMateriais = lazy(() => import("@/pages/formacao/FormacaoMateriais"));
const FormacaoConfiguracoes = lazy(() => import("@/pages/formacao/FormacaoConfiguracoes"));

const PageLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingScreen />}>
    {children}
  </Suspense>
);

export const AppRoutes = createBrowserRouter([
  {
    path: "/",
    element: <SmartRedirect />,
  },
  {
    path: "/login",
    element: (
      <RouteProtection level="public">
        <PageLoader>
          <LoginPage />
        </PageLoader>
      </RouteProtection>
    ),
  },
  {
    path: "/register",
    element: (
      <RouteProtection level="public">
        <PageLoader>
          <RegisterPage />
        </PageLoader>
      </RouteProtection>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <RouteProtection level="public">
        <PageLoader>
          <ResetPassword />
        </PageLoader>
      </RouteProtection>
    ),
  },
  {
    path: "/set-new-password",
    element: (
      <RouteProtection level="public">
        <PageLoader>
          <SetNewPassword />
        </PageLoader>
      </RouteProtection>
    ),
  },
  {
    path: "/onboarding",
    element: (
      <RouteProtection level="authenticated">
        <PageLoader>
          <OnboardingPage />
        </PageLoader>
      </RouteProtection>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <RouteProtection level="authenticated">
        <PageLoader>
          <Layout>
            <DashboardPage />
          </Layout>
        </PageLoader>
      </RouteProtection>
    ),
  },
  {
    path: "/admin",
    element: (
      <RouteProtection level="admin">
        <PageLoader>
          <Layout>
            <AdminDashboard />
          </Layout>
        </PageLoader>
      </RouteProtection>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <RouteProtection level="admin">
        <PageLoader>
          <Layout>
            <AdminUsers />
          </Layout>
        </PageLoader>
      </RouteProtection>
    ),
  },
  {
    path: "/admin/tools",
    element: (
      <RouteProtection level="admin">
        <PageLoader>
          <Layout>
            <AdminTools />
          </Layout>
        </PageLoader>
      </RouteProtection>
    ),
  },
  {
    path: "/admin/solutions",
    element: (
      <RouteProtection level="admin">
        <PageLoader>
          <Layout>
            <AdminSolutions />
          </Layout>
        </PageLoader>
      </RouteProtection>
    ),
  },
  {
    path: "/admin/analytics",
    element: (
      <RouteProtection level="admin">
        <PageLoader>
          <Layout>
            <AdminAnalytics />
          </Layout>
        </PageLoader>
      </RouteProtection>
    ),
  },
  {
    path: "/admin/suggestions",
    element: (
      <RouteProtection level="admin">
        <PageLoader>
          <Layout>
            <AdminSuggestions />
          </Layout>
        </PageLoader>
      </RouteProtection>
    ),
  },
  {
    path: "/admin/suggestions/:id",
    element: (
      <RouteProtection level="admin">
        <PageLoader>
          <Layout>
            <AdminSuggestionDetail />
          </Layout>
        </PageLoader>
      </RouteProtection>
    ),
  },
  {
    path: "/admin/events",
    element: (
      <RouteProtection level="admin">
        <PageLoader>
          <Layout>
            <AdminEvents />
          </Layout>
        </PageLoader>
      </RouteProtection>
    ),
  },
  {
    path: "/admin/roles",
    element: (
      <RouteProtection level="admin">
        <PageLoader>
          <Layout>
            <AdminRoles />
          </Layout>
        </PageLoader>
      </RouteProtection>
    ),
  },
  {
    path: "/admin/invites",
    element: (
      <RouteProtection level="admin">
        <PageLoader>
          <Layout>
            <AdminInvites />
          </Layout>
        </PageLoader>
      </RouteProtection>
    ),
  },
  {
    path: "/admin/communications",
    element: (
      <RouteProtection level="admin">
        <PageLoader>
          <Layout>
            <AdminCommunications />
          </Layout>
        </PageLoader>
      </RouteProtection>
    ),
  },
  {
    path: "/admin/security",
    element: (
      <RouteProtection level="admin">
        <PageLoader>
          <Layout>
            <AdminSecurity />
          </Layout>
        </PageLoader>
      </RouteProtection>
    ),
  },
  {
    path: "/formacao",
    element: (
      <RouteProtection level="formacao">
        <PageLoader>
          <Layout>
            <FormacaoDashboard />
          </Layout>
        </PageLoader>
      </RouteProtection>
    ),
  },
  {
    path: "/formacao/cursos",
    element: (
      <RouteProtection level="formacao">
        <PageLoader>
          <Layout>
            <FormacaoCursos />
          </Layout>
        </PageLoader>
      </RouteProtection>
    ),
  },
  {
    path: "/formacao/aulas",
    element: (
      <RouteProtection level="formacao">
        <PageLoader>
          <Layout>
            <FormacaoAulas />
          </Layout>
        </PageLoader>
      </RouteProtection>
    ),
  },
  {
    path: "/formacao/aulas/nova",
    element: (
      <RouteProtection level="formacao">
        <PageLoader>
          <Layout>
            <FormacaoNovaAula />
          </Layout>
        </PageLoader>
      </RouteProtection>
    ),
  },
  {
    path: "/formacao/materiais",
    element: (
      <RouteProtection level="formacao">
        <PageLoader>
          <Layout>
            <FormacaoMateriais />
          </Layout>
        </PageLoader>
      </RouteProtection>
    ),
  },
  {
    path: "/formacao/configuracoes",
    element: (
      <RouteProtection level="formacao">
        <PageLoader>
          <Layout>
            <FormacaoConfiguracoes />
          </Layout>
        </PageLoader>
      </RouteProtection>
    ),
  },
]);
