
import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { RouteProtection } from '@/components/routing/RouteProtection';
import { SmartRedirect } from '@/components/routing/SmartRedirect';
import LoadingScreen from '@/components/common/LoadingScreen';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('@/pages/Login'));
const RegisterPage = lazy(() => import('@/pages/Register'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPassword'));
const SetNewPasswordPage = lazy(() => import('@/pages/SetNewPassword'));
const OnboardingPage = lazy(() => import('@/pages/Onboarding'));
const DashboardPage = lazy(() => import('@/pages/Dashboard'));
const ProfilePage = lazy(() => import('@/pages/Profile'));
const ImplementationPage = lazy(() => import('@/pages/Implementation'));
const SolutionPage = lazy(() => import('@/pages/Solution'));
const ToolsPage = lazy(() => import('@/pages/Tools'));
const ToolDetailPage = lazy(() => import('@/pages/ToolDetail'));
const LearningPage = lazy(() => import('@/pages/Learning'));
const LearningCoursePage = lazy(() => import('@/pages/LearningCourse'));
const LearningLessonPage = lazy(() => import('@/pages/LearningLesson'));
const ImplementationTrailPage = lazy(() => import('@/pages/ImplementationTrail'));
const SuggestionsPage = lazy(() => import('@/pages/Suggestions'));
const SuggestionDetailPage = lazy(() => import('@/pages/SuggestionDetail'));
const CalendarPage = lazy(() => import('@/pages/Calendar'));
const CommunityPage = lazy(() => import('@/pages/Community'));
const CommunityTopicPage = lazy(() => import('@/pages/CommunityTopic'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Admin Pages
const AdminLayout = lazy(() => import('@/components/layout/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminTools = lazy(() => import('@/pages/admin/AdminTools'));
const AdminSolutions = lazy(() => import('@/pages/admin/AdminSolutions'));
const AdminSolutionEditor = lazy(() => import('@/pages/admin/AdminSolutionEditor'));
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'));
const AdminSuggestions = lazy(() => import('@/pages/admin/AdminSuggestions'));
const AdminSuggestionDetail = lazy(() => import('@/pages/admin/AdminSuggestionDetail'));
const AdminEvents = lazy(() => import('@/pages/admin/AdminEvents'));
const AdminRoles = lazy(() => import('@/pages/admin/AdminRoles'));
const AdminInvites = lazy(() => import('@/pages/admin/AdminInvites'));
const AdminCommunications = lazy(() => import('@/pages/admin/AdminCommunications'));
const AdminSecurity = lazy(() => import('@/pages/admin/AdminSecurity'));

// Formação/LMS Pages
const FormacaoLayout = lazy(() => import('@/components/layout/formacao/FormacaoLayout'));
const FormacaoDashboard = lazy(() => import('@/pages/formacao/FormacaoDashboard'));
const FormacaoCursos = lazy(() => import('@/pages/formacao/FormacaoCursos'));
const FormacaoAulas = lazy(() => import('@/pages/formacao/FormacaoAulas'));
const FormacaoNovaAula = lazy(() => import('@/pages/formacao/FormacaoNovaAula'));
const FormacaoMateriais = lazy(() => import('@/pages/formacao/FormacaoMateriais'));
const FormacaoConfiguracoes = lazy(() => import('@/pages/formacao/FormacaoConfiguracoes'));

// Member Layout
const MemberLayout = lazy(() => import('@/components/layout/MemberLayout'));

const PageLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingScreen />}>
    {children}
  </Suspense>
);

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<SmartRedirect />} />

      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <RouteProtection level="public">
            <PageLoader>
              <LoginPage />
            </PageLoader>
          </RouteProtection>
        }
      />
      <Route
        path="/register"
        element={
          <RouteProtection level="public">
            <PageLoader>
              <RegisterPage />
            </PageLoader>
          </RouteProtection>
        }
      />
      <Route
        path="/reset-password"
        element={
          <RouteProtection level="public">
            <PageLoader>
              <ResetPasswordPage />
            </PageLoader>
          </RouteProtection>
        }
      />
      <Route
        path="/set-new-password"
        element={
          <RouteProtection level="public">
            <PageLoader>
              <SetNewPasswordPage />
            </PageLoader>
          </RouteProtection>
        }
      />

      {/* Onboarding */}
      <Route
        path="/onboarding"
        element={
          <RouteProtection level="authenticated">
            <PageLoader>
              <OnboardingPage />
            </PageLoader>
          </RouteProtection>
        }
      />

      {/* Member Routes */}
      <Route
        path="/*"
        element={
          <RouteProtection level="authenticated">
            <PageLoader>
              <MemberLayout />
            </PageLoader>
          </RouteProtection>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="implementation/:slug" element={<ImplementationPage />} />
        <Route path="implementation/:slug/step/:step" element={<ImplementationPage />} />
        <Route path="solution/:slug" element={<SolutionPage />} />
        <Route path="tools" element={<ToolsPage />} />
        <Route path="tools/:toolId" element={<ToolDetailPage />} />
        <Route path="learning" element={<LearningPage />} />
        <Route path="learning/course/:courseId" element={<LearningCoursePage />} />
        <Route path="learning/lesson/:lessonId" element={<LearningLessonPage />} />
        <Route path="implementation-trail" element={<ImplementationTrailPage />} />
        <Route path="suggestions" element={<SuggestionsPage />} />
        <Route path="suggestions/:id" element={<SuggestionDetailPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="community" element={<CommunityPage />} />
        <Route path="community/:categoryId" element={<CommunityPage />} />
        <Route path="community/topic/:topicId" element={<CommunityTopicPage />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <RouteProtection level="admin">
            <PageLoader>
              <AdminLayout />
            </PageLoader>
          </RouteProtection>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="tools" element={<AdminTools />} />
        <Route path="solutions" element={<AdminSolutions />} />
        <Route path="solutions/:solutionId/editor" element={<AdminSolutionEditor />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="suggestions" element={<AdminSuggestions />} />
        <Route path="suggestions/:id" element={<AdminSuggestionDetail />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="roles" element={<AdminRoles />} />
        <Route path="invites" element={<AdminInvites />} />
        <Route path="communications" element={<AdminCommunications />} />
        <Route path="security" element={<AdminSecurity />} />
      </Route>

      {/* Formação/LMS Routes */}
      <Route
        path="/formacao/*"
        element={
          <RouteProtection level="formacao">
            <PageLoader>
              <FormacaoLayout />
            </PageLoader>
          </RouteProtection>
        }
      >
        <Route index element={<FormacaoDashboard />} />
        <Route path="cursos" element={<FormacaoCursos />} />
        <Route path="aulas" element={<FormacaoAulas />} />
        <Route path="aulas/nova" element={<FormacaoNovaAula />} />
        <Route path="materiais" element={<FormacaoMateriais />} />
        <Route path="configuracoes" element={<FormacaoConfiguracoes />} />
      </Route>

      {/* 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
