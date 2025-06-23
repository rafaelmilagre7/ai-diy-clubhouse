
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { LoadingFallback } from '@/components/common/LoadingFallback';
import { ErrorFallback } from '@/components/common/ErrorFallback';
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary';

// Layout imports
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import { FormacaoProtectedRoutes } from '@/auth/FormacaoProtectedRoutes';
import FormacaoLayout from '@/components/layout/formacao/FormacaoLayout';
import MemberLayout from '@/components/layout/MemberLayout';

// Lazy load pages
const Index = React.lazy(() => import('@/pages/Index'));
const OnboardingPage = React.lazy(() => import('@/pages/OnboardingPage'));
const Auth = React.lazy(() => import('@/pages/Auth'));
const Login = React.lazy(() => import('@/pages/auth/Login'));
const Register = React.lazy(() => import('@/pages/auth/Register'));
const ResetPassword = React.lazy(() => import('@/pages/auth/ResetPassword'));
const SetNewPassword = React.lazy(() => import('@/pages/auth/SetNewPassword'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));

// Admin pages
const AdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsers = React.lazy(() => import('@/pages/admin/AdminUsers'));
const AdminTools = React.lazy(() => import('@/pages/admin/AdminTools'));
const AdminToolEdit = React.lazy(() => import('@/pages/admin/AdminToolEdit'));
const AdminSolutions = React.lazy(() => import('@/pages/admin/AdminSolutions'));
const AdminSolutionCreate = React.lazy(() => import('@/pages/admin/AdminSolutionCreate'));
const SolutionEditor = React.lazy(() => import('@/pages/admin/SolutionEditor'));
const AdminAnalytics = React.lazy(() => import('@/pages/admin/AdminAnalytics'));
const AdminSuggestions = React.lazy(() => import('@/pages/admin/AdminSuggestions'));
const AdminEvents = React.lazy(() => import('@/pages/admin/AdminEvents'));
const AdminRoles = React.lazy(() => import('@/pages/admin/AdminRoles'));
const InvitesManagement = React.lazy(() => import('@/pages/admin/invites/InvitesManagement'));
const WhatsAppDebug = React.lazy(() => import('@/pages/admin/WhatsAppDebug'));
const EmailDebug = React.lazy(() => import('@/pages/admin/EmailDebug'));
const AdminCommunications = React.lazy(() => import('@/pages/admin/AdminCommunications'));
const SupabaseDiagnostics = React.lazy(() => import('@/pages/admin/SupabaseDiagnostics'));
const AdminSecurity = React.lazy(() => import('@/pages/admin/AdminSecurity'));

// Formação pages
const FormacaoDashboard = React.lazy(() => import('@/pages/formacao/FormacaoDashboard'));
const FormacaoCursos = React.lazy(() => import('@/pages/formacao/FormacaoCursos'));
const FormacaoCursoDetalhes = React.lazy(() => import('@/pages/formacao/FormacaoCursoDetalhes'));
const FormacaoMateriais = React.lazy(() => import('@/pages/formacao/FormacaoMateriais'));
const FormacaoAulaDetalhes = React.lazy(() => import('@/pages/formacao/FormacaoAulaDetalhes'));
const FormacaoAulaEditar = React.lazy(() => import('@/pages/formacao/FormacaoAulaEditar'));
const ModuloDetalhes = React.lazy(() => import('@/pages/formacao/ModuloDetalhes'));
const FormacaoModuloDetalhes = React.lazy(() => import('@/pages/formacao/FormacaoModuloDetalhes'));
const FormacaoCertificateTemplates = React.lazy(() => import('@/pages/formacao/FormacaoCertificateTemplates'));

// Member pages
const Dashboard = React.lazy(() => import('@/pages/member/Dashboard'));
const Profile = React.lazy(() => import('@/pages/member/Profile'));
const EditProfile = React.lazy(() => import('@/pages/member/EditProfile'));
const Tools = React.lazy(() => import('@/pages/member/Tools'));
const ToolDetails = React.lazy(() => import('@/pages/member/ToolDetails'));
const Solutions = React.lazy(() => import('@/pages/member/Solutions'));
const SolutionDetails = React.lazy(() => import('@/pages/member/SolutionDetails'));
const ImplementationTrail = React.lazy(() => import('@/pages/member/ImplementationTrail'));
const Suggestions = React.lazy(() => import('@/pages/member/Suggestions'));
const SuggestionDetails = React.lazy(() => import('@/pages/member/SuggestionDetails'));
const NewSuggestion = React.lazy(() => import('@/pages/member/NewSuggestion'));
const Events = React.lazy(() => import('@/pages/member/Events'));
const Achievements = React.lazy(() => import('@/pages/member/Achievements'));
const LearningPage = React.lazy(() => import('@/pages/member/learning/LearningPage'));
const CourseDetails = React.lazy(() => import('@/pages/member/learning/CourseDetails'));
const LessonView = React.lazy(() => import('@/pages/member/learning/LessonView'));
const MemberCertificates = React.lazy(() => import('@/pages/member/learning/MemberCertificates'));
const ForumHome = React.lazy(() => import('@/pages/member/forum/ForumHome'));
const CategoryView = React.lazy(() => import('@/pages/member/forum/CategoryView'));
const NewTopic = React.lazy(() => import('@/pages/member/forum/NewTopic'));

const AppRoutes = () => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Router Error:', error, errorInfo);
      }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/set-new-password" element={<SetNewPassword />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Admin routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoutes>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoutes>
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/admin/tools" 
            element={
              <ProtectedRoutes>
                <AdminLayout>
                  <AdminTools />
                </AdminLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/admin/tools/new" 
            element={
              <ProtectedRoutes>
                <AdminLayout>
                  <AdminToolEdit />
                </AdminLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/admin/tools/:id" 
            element={
              <ProtectedRoutes>
                <AdminLayout>
                  <AdminToolEdit />
                </AdminLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/admin/solutions" 
            element={
              <ProtectedRoutes>
                <AdminLayout>
                  <AdminSolutions />
                </AdminLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/admin/solutions/new" 
            element={
              <ProtectedRoutes>
                <AdminLayout>
                  <AdminSolutionCreate />
                </AdminLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/admin/solutions/:id" 
            element={
              <ProtectedRoutes>
                <AdminLayout>
                  <SolutionEditor />
                </AdminLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/admin/analytics" 
            element={
              <ProtectedRoutes>
                <AdminLayout>
                  <AdminAnalytics />
                </AdminLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/admin/suggestions" 
            element={
              <ProtectedRoutes>
                <AdminLayout>
                  <AdminSuggestions />
                </AdminLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/admin/events" 
            element={
              <ProtectedRoutes>
                <AdminLayout>
                  <AdminEvents />
                </AdminLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/admin/roles" 
            element={
              <ProtectedRoutes>
                <AdminLayout>
                  <AdminRoles />
                </AdminLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/admin/invites" 
            element={
              <ProtectedRoutes>
                <AdminLayout>
                  <InvitesManagement />
                </AdminLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/admin/communications" 
            element={
              <ProtectedRoutes>
                <AdminLayout>
                  <AdminCommunications />
                </AdminLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/admin/security" 
            element={
              <ProtectedRoutes>
                <AdminLayout>
                  <AdminSecurity />
                </AdminLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/admin/whatsapp-debug" 
            element={
              <ProtectedRoutes>
                <AdminLayout>
                  <WhatsAppDebug />
                </AdminLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/admin/email-debug" 
            element={
              <ProtectedRoutes>
                <AdminLayout>
                  <EmailDebug />
                </AdminLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/admin/diagnostics" 
            element={
              <ProtectedRoutes>
                <AdminLayout>
                  <SupabaseDiagnostics />
                </AdminLayout>
              </ProtectedRoutes>
            } 
          />

          {/* Formação (LMS) routes */}
          <Route 
            path="/formacao" 
            element={
              <FormacaoProtectedRoutes>
                <FormacaoLayout>
                  <FormacaoDashboard />
                </FormacaoLayout>
              </FormacaoProtectedRoutes>
            } 
          />
          <Route 
            path="/formacao/cursos" 
            element={
              <FormacaoProtectedRoutes>
                <FormacaoLayout>
                  <FormacaoCursos />
                </FormacaoLayout>
              </FormacaoProtectedRoutes>
            } 
          />
          <Route 
            path="/formacao/cursos/:courseId" 
            element={
              <FormacaoProtectedRoutes>
                <FormacaoLayout>
                  <FormacaoCursoDetalhes />
                </FormacaoLayout>
              </FormacaoProtectedRoutes>
            } 
          />
          <Route 
            path="/formacao/materiais" 
            element={
              <FormacaoProtectedRoutes>
                <FormacaoLayout>
                  <FormacaoMateriais />
                </FormacaoLayout>
              </FormacaoProtectedRoutes>
            } 
          />
          <Route 
            path="/formacao/cursos/:courseId/modulos/:moduleId" 
            element={
              <FormacaoProtectedRoutes>
                <FormacaoLayout>
                  <FormacaoModuloDetalhes />
                </FormacaoLayout>
              </FormacaoProtectedRoutes>
            } 
          />
          <Route 
            path="/formacao/cursos/:courseId/modulos/:moduleId/aulas/:aulaId" 
            element={
              <FormacaoProtectedRoutes>
                <FormacaoLayout>
                  <FormacaoAulaDetalhes />
                </FormacaoLayout>
              </FormacaoProtectedRoutes>
            } 
          />
          <Route 
            path="/formacao/cursos/:courseId/modulos/:moduleId/aulas/:aulaId/editar" 
            element={
              <FormacaoProtectedRoutes>
                <FormacaoLayout>
                  <FormacaoAulaEditar />
                </FormacaoLayout>
              </FormacaoProtectedRoutes>
            } 
          />
          <Route 
            path="/formacao/modulos/:moduleId" 
            element={
              <FormacaoProtectedRoutes>
                <FormacaoLayout>
                  <ModuloDetalhes />
                </FormacaoLayout>
              </FormacaoProtectedRoutes>
            } 
          />
          <Route 
            path="/formacao/certificate-templates" 
            element={
              <FormacaoProtectedRoutes>
                <FormacaoLayout>
                  <FormacaoCertificateTemplates />
                </FormacaoLayout>
              </FormacaoProtectedRoutes>
            } 
          />

          {/* Member routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoutes>
                <MemberLayout>
                  <Dashboard />
                </MemberLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoutes>
                <MemberLayout>
                  <Profile />
                </MemberLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/profile/edit" 
            element={
              <ProtectedRoutes>
                <MemberLayout>
                  <EditProfile />
                </MemberLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/tools" 
            element={
              <ProtectedRoutes>
                <MemberLayout>
                  <Tools />
                </MemberLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/tools/:id" 
            element={
              <ProtectedRoutes>
                <MemberLayout>
                  <ToolDetails />
                </MemberLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/solutions" 
            element={
              <ProtectedRoutes>
                <MemberLayout>
                  <Solutions />
                </MemberLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/solutions/:id" 
            element={
              <ProtectedRoutes>
                <MemberLayout>
                  <SolutionDetails />
                </MemberLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/solutions/:id/implement" 
            element={
              <ProtectedRoutes>
                <MemberLayout>
                  <SolutionDetails />
                </MemberLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/solutions/:id/implement/:moduleIndex" 
            element={
              <ProtectedRoutes>
                <MemberLayout>
                  <SolutionDetails />
                </MemberLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/implementation-trail" 
            element={
              <ProtectedRoutes>
                <MemberLayout>
                  <ImplementationTrail />
                </MemberLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/suggestions" 
            element={
              <ProtectedRoutes>
                <MemberLayout>
                  <Suggestions />
                </MemberLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/suggestions/:id" 
            element={
              <ProtectedRoutes>
                <MemberLayout>
                  <SuggestionDetails />
                </MemberLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/suggestions/new" 
            element={
              <ProtectedRoutes>
                <MemberLayout>
                  <NewSuggestion />
                </MemberLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/events" 
            element={
              <ProtectedRoutes>
                <MemberLayout>
                  <Events />
                </MemberLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/achievements" 
            element={
              <ProtectedRoutes>
                <MemberLayout>
                  <Achievements />
                </MemberLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/learning" 
            element={
              <ProtectedRoutes>
                <MemberLayout>
                  <LearningPage />
                </MemberLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/learning/courses/:courseId" 
            element={
              <ProtectedRoutes>
                <MemberLayout>
                  <CourseDetails />
                </MemberLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/learning/courses/:courseId/lessons/:lessonId" 
            element={
              <ProtectedRoutes>
                <MemberLayout>
                  <LessonView />
                </MemberLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/learning/certificates" 
            element={
              <ProtectedRoutes>
                <MemberLayout>
                  <MemberCertificates />
                </MemberLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/forum" 
            element={
              <ProtectedRoutes>
                <MemberLayout>
                  <ForumHome />
                </MemberLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/forum/categories/:categoryId" 
            element={
              <ProtectedRoutes>
                <MemberLayout>
                  <CategoryView />
                </MemberLayout>
              </ProtectedRoutes>
            } 
          />
          <Route 
            path="/forum/new-topic" 
            element={
              <ProtectedRoutes>
                <MemberLayout>
                  <NewTopic />
                </MemberLayout>
              </ProtectedRoutes>
            } 
          />

          {/* Catch all route */}
          <Route 
            path="*" 
            element={
              <RouteErrorBoundary>
                <NotFound />
              </RouteErrorBoundary>
            } 
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRoutes;
