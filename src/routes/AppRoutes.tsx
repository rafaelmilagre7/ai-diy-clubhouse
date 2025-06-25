
import { createBrowserRouter } from "react-router-dom";
import { RouteProtection } from "@/components/routing/RouteProtection";
import { SmartRedirect } from "@/components/routing/SmartRedirect";

// Layouts
import AdminLayout from '@/components/layout/admin/AdminLayout';
import MemberLayout from '@/components/layout/MemberLayout';
import FormacaoLayout from '@/components/layout/formacao/FormacaoLayout';

// Auth pages
import AuthLayout from '@/components/auth/AuthLayout';
import RegisterPage from '@/pages/auth/RegisterPage';
import OnboardingPage from '@/pages/OnboardingPage';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import SolutionsList from '@/pages/admin/SolutionsList';
import SolutionEditor from '@/pages/admin/SolutionEditor';
import AdminTools from '@/pages/admin/AdminTools';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminRoles from '@/pages/admin/AdminRoles';
import AdminInvites from '@/pages/admin/AdminInvites';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminCommunications from '@/pages/admin/AdminCommunications';
import AdminSecurity from '@/pages/admin/AdminSecurity';
import AdminBenefits from '@/pages/admin/AdminBenefits';
import AdminEvents from '@/pages/admin/AdminEvents';

// Member pages
import Dashboard from '@/pages/member/Dashboard';
import Solutions from '@/pages/member/Solutions';
import Tools from '@/pages/member/Tools';
import Profile from '@/pages/member/Profile';
import EditProfile from '@/pages/member/EditProfile';
import Benefits from '@/pages/member/Benefits';
import Events from '@/pages/member/Events';
import Suggestions from '@/pages/member/Suggestions';

// Profile sub-pages
import NotificationSettingsPage from '@/pages/profile/NotificationSettingsPage';

// Learning pages
import LearningPage from '@/pages/member/learning/LearningPage';
import CourseDetails from '@/pages/member/learning/CourseDetails';
import LessonView from '@/pages/member/learning/LessonView';
import MemberCertificates from '@/pages/member/learning/MemberCertificates';

// Formação pages
import FormacaoDashboard from '@/pages/formacao/FormacaoDashboard';
import FormacaoCursos from '@/pages/formacao/FormacaoCursos';
import FormacaoModuloDetalhes from '@/pages/formacao/FormacaoModuloDetalhes';
import FormacaoAulaDetalhes from '@/pages/formacao/FormacaoAulaDetalhes';

// Error pages
import NotFound from '@/pages/NotFound';

// Helper para criar rotas protegidas
const createProtectedRoute = (
  path: string, 
  Component: React.ComponentType, 
  Layout: React.ComponentType<{ children: React.ReactNode }>,
  level: 'authenticated' | 'admin' | 'formacao' = 'authenticated'
) => ({
  path,
  element: (
    <RouteProtection level={level}>
      <Layout>
        <Component />
      </Layout>
    </RouteProtection>
  )
});

export const AppRoutes = createBrowserRouter([
  // Rota raiz com redirecionamento inteligente
  {
    path: "/",
    element: <SmartRedirect />
  },

  // Rotas públicas de autenticação
  {
    path: "/login",
    element: (
      <RouteProtection level="public">
        <AuthLayout />
      </RouteProtection>
    )
  },
  {
    path: "/convite/:token",
    element: (
      <RouteProtection level="public">
        <RegisterPage />
      </RouteProtection>
    )
  },
  {
    path: "/invite/:token", 
    element: (
      <RouteProtection level="public">
        <RegisterPage />
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
  createProtectedRoute("/dashboard", Dashboard, MemberLayout),
  createProtectedRoute("/solutions", Solutions, MemberLayout),
  createProtectedRoute("/tools", Tools, MemberLayout),
  createProtectedRoute("/profile", Profile, MemberLayout),
  createProtectedRoute("/profile/edit", EditProfile, MemberLayout),
  createProtectedRoute("/profile/notifications", NotificationSettingsPage, MemberLayout),
  createProtectedRoute("/benefits", Benefits, MemberLayout),
  createProtectedRoute("/events", Events, MemberLayout),
  createProtectedRoute("/suggestions", Suggestions, MemberLayout),

  // Rotas de Learning (autenticadas)
  createProtectedRoute("/learning", LearningPage, MemberLayout),
  createProtectedRoute("/learning/course/:id", CourseDetails, MemberLayout),
  createProtectedRoute("/learning/course/:courseId/lesson/:lessonId", LessonView, MemberLayout),
  createProtectedRoute("/learning/certificates", MemberCertificates, MemberLayout),

  // Rotas de admin (requer permissão admin)
  createProtectedRoute("/admin", AdminDashboard, AdminLayout, 'admin'),
  createProtectedRoute("/admin/dashboard", AdminDashboard, AdminLayout, 'admin'),
  createProtectedRoute("/admin/solutions", SolutionsList, AdminLayout, 'admin'),
  createProtectedRoute("/admin/solutions/new", SolutionEditor, AdminLayout, 'admin'),
  createProtectedRoute("/admin/solutions/:id", SolutionEditor, AdminLayout, 'admin'),
  createProtectedRoute("/admin/tools", AdminTools, AdminLayout, 'admin'),
  createProtectedRoute("/admin/users", AdminUsers, AdminLayout, 'admin'),
  createProtectedRoute("/admin/roles", AdminRoles, AdminLayout, 'admin'),
  createProtectedRoute("/admin/invites", AdminInvites, AdminLayout, 'admin'),
  createProtectedRoute("/admin/analytics", AdminAnalytics, AdminLayout, 'admin'),
  createProtectedRoute("/admin/communications", AdminCommunications, AdminLayout, 'admin'),
  createProtectedRoute("/admin/security", AdminSecurity, AdminLayout, 'admin'),
  createProtectedRoute("/admin/benefits", AdminBenefits, AdminLayout, 'admin'),
  createProtectedRoute("/admin/events", AdminEvents, AdminLayout, 'admin'),

  // Rotas de formação (requer permissão formacao ou admin)
  createProtectedRoute("/formacao", FormacaoDashboard, FormacaoLayout, 'formacao'),
  createProtectedRoute("/formacao/cursos", FormacaoCursos, FormacaoLayout, 'formacao'),
  createProtectedRoute("/formacao/cursos/:id/modulos", FormacaoModuloDetalhes, FormacaoLayout, 'formacao'),
  createProtectedRoute("/formacao/modulos/:id/aulas", FormacaoAulaDetalhes, FormacaoLayout, 'formacao'),

  // Rota 404
  {
    path: "*",
    element: <NotFound />
  }
]);
