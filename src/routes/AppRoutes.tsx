
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import LoadingScreen from '@/components/common/LoadingScreen';

// Auth Routes
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import SetNewPasswordPage from '@/pages/auth/SetNewPasswordPage';
import InvitePage from '@/pages/auth/InvitePage';

// Member Routes Components
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import MemberLayout from '@/components/layout/MemberLayout';
import RootRedirect from '@/components/routing/RootRedirect';

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
import ImplementationTrail from '@/pages/member/ImplementationTrail';
import Benefits from '@/pages/member/Benefits';
import Suggestions from '@/pages/member/Suggestions';
import SuggestionDetails from '@/pages/member/SuggestionDetails';
import NewSuggestion from '@/pages/member/NewSuggestion';
import Events from '@/pages/member/Events';
import SolutionCertificate from '@/pages/member/SolutionCertificate';

// Member Learning pages
import LearningPage from '@/pages/member/learning/LearningPage';
import CourseDetails from '@/pages/member/learning/CourseDetails';
import LessonView from '@/pages/member/learning/LessonView';
import MemberCertificates from '@/pages/member/learning/MemberCertificates';

// Member Community pages
import CommunityHome from '@/pages/member/community/CommunityHome';
import TopicView from '@/pages/member/community/TopicView';
import CategoryView from '@/pages/member/community/CategoryView';
import NewTopic from '@/pages/member/community/NewTopic';

// Profile pages
import NotificationSettingsPage from '@/pages/profile/NotificationSettingsPage';

// Admin Routes
import { AdminProtectedRoutes } from '@/auth/AdminProtectedRoutes';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminSolutions from '@/pages/admin/AdminSolutions';
import AdminSolutionEditor from '@/pages/admin/AdminSolutionEditor';
import AdminTools from '@/pages/admin/AdminTools';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminCommunication from '@/pages/admin/AdminCommunication';
import AdminInvites from '@/pages/admin/AdminInvites';
import AdminRoles from '@/pages/admin/AdminRoles';
import AdminSecurity from '@/pages/admin/AdminSecurity';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';

// Formacao Routes
import { FormacaoProtectedRoutes } from '@/auth/FormacaoProtectedRoutes';
import FormacaoLayout from '@/components/layout/formacao/FormacaoLayout';
import FormacaoDashboard from '@/pages/formacao/FormacaoDashboard';
import FormacaoCursos from '@/pages/formacao/FormacaoCursos';
import FormacaoAulas from '@/pages/formacao/FormacaoAulas';
import FormacaoMateriais from '@/pages/formacao/FormacaoMateriais';

// Certificate Routes
import CertificateValidation from '@/pages/certificate/CertificateValidation';

// Função helper para criar rotas protegidas com MemberLayout
const createProtectedRoute = (Component: React.ComponentType<any>) => (
  <ProtectedRoutes>
    <MemberLayout>
      <Component />
    </MemberLayout>
  </ProtectedRoutes>
);

// Função helper para criar rotas protegidas de admin
const createAdminRoute = (Component: React.ComponentType<any>) => (
  <AdminProtectedRoutes>
    <AdminLayout>
      <Component />
    </AdminLayout>
  </AdminProtectedRoutes>
);

// Função helper para criar rotas protegidas de formação
const createFormacaoRoute = (Component: React.ComponentType<any>) => (
  <FormacaoProtectedRoutes>
    <FormacaoLayout>
      <Component />
    </FormacaoLayout>
  </FormacaoProtectedRoutes>
);

const AppRoutes = () => {
  const { user, isLoading, isAdmin, isFormacao } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Carregando aplicação..." />;
  }

  return (
    <Routes>
      {/* Rota raiz com redirecionamento inteligente */}
      <Route path="/" element={<RootRedirect />} />
      
      {/* Auth Routes - Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/set-new-password" element={<SetNewPasswordPage />} />
      <Route path="/invite/:token" element={<InvitePage />} />

      {/* Certificate Validation - Público */}
      <Route path="/certificate/:validationCode" element={<CertificateValidation />} />

      {/* Member Routes - Protegidas */}
      <Route path="/dashboard" element={createProtectedRoute(Dashboard)} />
      <Route path="/solutions" element={createProtectedRoute(Solutions)} />
      <Route path="/trilha-implementacao" element={createProtectedRoute(ImplementationTrail)} />
      <Route path="/tools" element={createProtectedRoute(Tools)} />
      <Route path="/tools/:id" element={createProtectedRoute(ToolDetails)} />
      <Route path="/profile" element={createProtectedRoute(Profile)} />
      <Route path="/profile/edit" element={createProtectedRoute(EditProfile)} />
      <Route path="/profile/notifications" element={createProtectedRoute(NotificationSettingsPage)} />
      <Route path="/solution/:id" element={createProtectedRoute(SolutionDetails)} />
      <Route path="/solution/:id/certificate" element={createProtectedRoute(SolutionCertificate)} />
      <Route path="/implement/:id/:moduleIdx" element={createProtectedRoute(SolutionImplementation)} />
      <Route path="/implementation/:id" element={createProtectedRoute(SolutionImplementation)} />
      <Route path="/implementation/:id/:moduleIdx" element={createProtectedRoute(SolutionImplementation)} />
      <Route path="/implementation/completed/:id" element={createProtectedRoute(ImplementationCompleted)} />
      <Route path="/benefits" element={createProtectedRoute(Benefits)} />
      <Route path="/events" element={createProtectedRoute(Events)} />

      {/* Learning/LMS Routes - CORRIGIDAS */}
      <Route path="/learning" element={createProtectedRoute(LearningPage)} />
      <Route path="/learning/course/:id" element={createProtectedRoute(CourseDetails)} />
      <Route path="/learning/course/:courseId/lesson/:lessonId" element={createProtectedRoute(LessonView)} />
      <Route path="/learning/certificates" element={createProtectedRoute(MemberCertificates)} />

      {/* Sugestões Routes */}
      <Route path="/suggestions" element={createProtectedRoute(Suggestions)} />
      <Route path="/suggestions/:id" element={createProtectedRoute(SuggestionDetails)} />
      <Route path="/suggestions/new" element={createProtectedRoute(NewSuggestion)} />

      {/* Comunidade Routes */}
      <Route path="/comunidade" element={createProtectedRoute(CommunityHome)} />
      <Route path="/comunidade/topico/:topicId" element={createProtectedRoute(TopicView)} />
      <Route path="/comunidade/categoria/:slug" element={createProtectedRoute(CategoryView)} />
      <Route path="/comunidade/novo-topico/:categorySlug" element={createProtectedRoute(NewTopic)} />

      {/* Admin Routes - Protegidas */}
      <Route path="/admin" element={createAdminRoute(AdminDashboard)} />
      <Route path="/admin/dashboard" element={createAdminRoute(AdminDashboard)} />
      <Route path="/admin/users" element={createAdminRoute(AdminUsers)} />
      <Route path="/admin/solutions" element={createAdminRoute(AdminSolutions)} />
      <Route path="/admin/solutions/create" element={createAdminRoute(AdminSolutionEditor)} />
      <Route path="/admin/solutions/:id/edit" element={createAdminRoute(AdminSolutionEditor)} />
      <Route path="/admin/tools" element={createAdminRoute(AdminTools)} />
      <Route path="/admin/events" element={createAdminRoute(AdminEvents)} />
      <Route path="/admin/communication" element={createAdminRoute(AdminCommunication)} />
      <Route path="/admin/invites" element={createAdminRoute(AdminInvites)} />
      <Route path="/admin/roles" element={createAdminRoute(AdminRoles)} />
      <Route path="/admin/security" element={createAdminRoute(AdminSecurity)} />
      <Route path="/admin/analytics" element={createAdminRoute(AdminAnalytics)} />

      {/* Formacao Routes - Protegidas */}
      <Route path="/formacao" element={createFormacaoRoute(FormacaoDashboard)} />
      <Route path="/formacao/dashboard" element={createFormacaoRoute(FormacaoDashboard)} />
      <Route path="/formacao/cursos" element={createFormacaoRoute(FormacaoCursos)} />
      <Route path="/formacao/cursos/:courseId/aulas" element={createFormacaoRoute(FormacaoAulas)} />
      <Route path="/formacao/materiais" element={createFormacaoRoute(FormacaoMateriais)} />

      {/* Fallback - Redirecionar para página apropriada */}
      <Route
        path="*"
        element={
          user ? (
            isAdmin ? (
              <Navigate to="/admin/dashboard" replace />
            ) : isFormacao ? (
              <Navigate to="/formacao/dashboard" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default AppRoutes;
