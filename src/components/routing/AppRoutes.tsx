
import { Routes, Route } from 'react-router-dom';
import { AdminProtectedRoutes } from '@/auth/AdminProtectedRoutes';
import { FormacaoProtectedRoutes } from '@/auth/FormacaoProtectedRoutes';
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ResetPassword from '@/pages/auth/ResetPassword';
import SetNewPassword from '@/pages/auth/SetNewPassword';
import NotFound from '@/pages/NotFound';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminSolutions from '@/pages/admin/AdminSolutions';
import AdminTools from '@/pages/admin/AdminTools';
import AdminSuggestions from '@/pages/admin/AdminSuggestions';
import AdminOnboarding from '@/pages/admin/AdminOnboarding';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminSolutionCreate from '@/pages/admin/AdminSolutionCreate';
import AdminSolutionEdit from '@/pages/admin/AdminSolutionEdit';
import SolutionEditor from '@/pages/admin/SolutionEditor';
import AdminToolEdit from '@/pages/admin/AdminToolEdit';
import AdminSuggestionDetails from '@/pages/admin/AdminSuggestionDetails';
import Dashboard from '@/pages/member/Dashboard';
import Solutions from '@/pages/member/Solutions';
import Tools from '@/pages/member/Tools';
import ToolDetails from '@/pages/member/ToolDetails';
import Profile from '@/pages/member/Profile';
import EditProfile from '@/pages/member/EditProfile';
import SolutionDetails from '@/pages/member/SolutionDetails';
import SolutionImplementation from '@/pages/member/SolutionImplementation';
import ImplementationCompleted from '@/pages/member/ImplementationCompleted';
import Benefits from '@/pages/member/Benefits';
import Achievements from '@/pages/member/Achievements';
import Suggestions from '@/pages/member/Suggestions';
import SuggestionDetails from '@/pages/member/SuggestionDetails';
import NewSuggestion from '@/pages/member/NewSuggestion';
import { Navigate } from 'react-router-dom';
import MemberLayout from '@/components/layout/MemberLayout';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import FormacaoLayout from '@/components/layout/formacao/FormacaoLayout';
import ImplementationTrailPage from '@/pages/member/ImplementationTrailPage';
import AdminEvents from '@/pages/admin/AdminEvents';
import Events from '@/pages/member/Events';
import MemberLearning from '@/pages/member/learning/MemberLearning';
import CourseDetails from '@/pages/member/learning/CourseDetails';
import LessonView from '@/pages/member/learning/LessonView';
// Importar as novas páginas do wizard
import FormacaoAulaNova from '@/pages/formacao/FormacaoAulaNova';
import FormacaoAulaNovaVideos from '@/pages/formacao/FormacaoAulaNovaVideos';
import FormacaoAulaNovaMateriaisPage from '@/pages/formacao/FormacaoAulaNovaMateriaisPage';
import FormacaoAulaNovaRevisar from '@/pages/formacao/FormacaoAulaNovaRevisar';

const AppRoutes = () => {
  console.log("Renderizando AppRoutes");
  
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/set-new-password" element={<SetNewPassword />} />
      
      {/* Member Routes with Layout */}
      <Route path="/" element={<ProtectedRoutes><MemberLayout><Dashboard /></MemberLayout></ProtectedRoutes>} />
      <Route path="/dashboard" element={<ProtectedRoutes><MemberLayout><Dashboard /></MemberLayout></ProtectedRoutes>} />
      <Route path="/implementation-trail" element={<ProtectedRoutes><MemberLayout><ImplementationTrailPage /></MemberLayout></ProtectedRoutes>} />
      <Route path="/solutions" element={<ProtectedRoutes><MemberLayout><Solutions /></MemberLayout></ProtectedRoutes>} />
      <Route path="/tools" element={<ProtectedRoutes><MemberLayout><Tools /></MemberLayout></ProtectedRoutes>} />
      <Route path="/tools/:id" element={<ProtectedRoutes><MemberLayout><ToolDetails /></MemberLayout></ProtectedRoutes>} />
      <Route path="/profile" element={<ProtectedRoutes><MemberLayout><Profile /></MemberLayout></ProtectedRoutes>} />
      <Route path="/profile/edit" element={<ProtectedRoutes><MemberLayout><EditProfile /></MemberLayout></ProtectedRoutes>} />
      <Route path="/solution/:id" element={<ProtectedRoutes><MemberLayout><SolutionDetails /></MemberLayout></ProtectedRoutes>} />
      <Route path="/implement/:id/:moduleIdx" element={<ProtectedRoutes><MemberLayout><SolutionImplementation /></MemberLayout></ProtectedRoutes>} />
      <Route path="/implementation/:id" element={<ProtectedRoutes><MemberLayout><SolutionImplementation /></MemberLayout></ProtectedRoutes>} />
      <Route path="/implementation/:id/:moduleIdx" element={<ProtectedRoutes><MemberLayout><SolutionImplementation /></MemberLayout></ProtectedRoutes>} />
      <Route path="/implementation/completed/:id" element={<ProtectedRoutes><MemberLayout><ImplementationCompleted /></MemberLayout></ProtectedRoutes>} />
      <Route path="/benefits" element={<ProtectedRoutes><MemberLayout><Benefits /></MemberLayout></ProtectedRoutes>} />
      <Route path="/achievements" element={<ProtectedRoutes><MemberLayout><Achievements /></MemberLayout></ProtectedRoutes>} />
      <Route path="/events" element={<ProtectedRoutes><MemberLayout><Events /></MemberLayout></ProtectedRoutes>} />

      {/* Learning Routes */}
      <Route path="/learning" element={<ProtectedRoutes><MemberLayout><MemberLearning /></MemberLayout></ProtectedRoutes>} />
      <Route path="/learning/course/:id" element={<ProtectedRoutes><MemberLayout><CourseDetails /></MemberLayout></ProtectedRoutes>} />
      <Route path="/learning/course/:courseId/lesson/:lessonId" element={<ProtectedRoutes><MemberLayout><LessonView /></MemberLayout></ProtectedRoutes>} />
      
      {/* Sugestões Routes */}
      <Route path="/suggestions" element={<ProtectedRoutes><MemberLayout><Suggestions /></MemberLayout></ProtectedRoutes>} />
      <Route path="/suggestions/:id" element={<ProtectedRoutes><MemberLayout><SuggestionDetails /></MemberLayout></ProtectedRoutes>} />
      <Route path="/suggestions/new" element={<ProtectedRoutes><MemberLayout><NewSuggestion /></MemberLayout></ProtectedRoutes>} />
      
      {/* Onboarding Routes */}
      <Route path="/onboarding" element={<ProtectedRoutes><OnboardingIntro /></ProtectedRoutes>} />
      <Route path="/onboarding/personal-info" element={<ProtectedRoutes><PersonalInfo /></ProtectedRoutes>} />
      <Route path="/onboarding/professional-data" element={<ProtectedRoutes><ProfessionalData /></ProtectedRoutes>} />
      <Route path="/onboarding/business-context" element={<ProtectedRoutes><BusinessContext /></ProtectedRoutes>} />
      <Route path="/onboarding/ai-experience" element={<ProtectedRoutes><AIExperience /></ProtectedRoutes>} />
      <Route path="/onboarding/club-goals" element={<ProtectedRoutes><BusinessGoalsClub /></ProtectedRoutes>} />
      <Route path="/onboarding/customization" element={<ProtectedRoutes><ExperiencePersonalization /></ProtectedRoutes>} />
      <Route path="/onboarding/complementary" element={<ProtectedRoutes><ComplementaryInfo /></ProtectedRoutes>} />
      <Route path="/onboarding/review" element={<ProtectedRoutes><Review /></ProtectedRoutes>} />
      <Route path="/onboarding/trail-generation" element={<ProtectedRoutes><TrailGeneration /></ProtectedRoutes>} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/events" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminEvents />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/users" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminUsers />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/solutions" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminSolutions />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/solutions/new" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminSolutionCreate />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/solutions/:id" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminSolutionEdit />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/solutions/:id/editor" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <SolutionEditor />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/tools" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminTools />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/tools/new" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminToolEdit />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/tools/:id" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminToolEdit />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/suggestions" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminSuggestions />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/suggestions/:id" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminSuggestionDetails />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/onboarding" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminOnboarding />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      <Route path="/admin/analytics" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminAnalytics />
          </AdminLayout>
        </AdminProtectedRoutes>
      } />
      
      {/* Formação Routes with Layout */}
      <Route path="/formacao" element={<FormacaoProtectedRoutes><FormacaoLayout><FormacaoDashboard /></FormacaoLayout></FormacaoProtectedRoutes>} />
      <Route path="/formacao/cursos" element={<FormacaoProtectedRoutes><FormacaoLayout><FormacaoCursos /></FormacaoLayout></FormacaoProtectedRoutes>} />
      <Route path="/formacao/cursos/:id" element={<FormacaoProtectedRoutes><FormacaoLayout><FormacaoCursoDetalhes /></FormacaoLayout></FormacaoProtectedRoutes>} />
      <Route path="/formacao/modulos/:id" element={<FormacaoProtectedRoutes><FormacaoLayout><FormacaoModuloDetalhes /></FormacaoLayout></FormacaoProtectedRoutes>} />
      <Route path="/formacao/aulas" element={<FormacaoProtectedRoutes><FormacaoLayout><FormacaoAulas /></FormacaoLayout></FormacaoProtectedRoutes>} />
      
      {/* Novas rotas para o wizard de aulas */}
      <Route path="/formacao/aulas/nova" element={<FormacaoProtectedRoutes><FormacaoLayout><FormacaoAulaNova /></FormacaoLayout></FormacaoProtectedRoutes>} />
      <Route path="/formacao/aulas/nova/videos" element={<FormacaoProtectedRoutes><FormacaoLayout><FormacaoAulaNovaVideos /></FormacaoLayout></FormacaoProtectedRoutes>} />
      <Route path="/formacao/aulas/nova/materiais" element={<FormacaoProtectedRoutes><FormacaoLayout><FormacaoAulaNovaMateriaisPage /></FormacaoLayout></FormacaoProtectedRoutes>} />
      <Route path="/formacao/aulas/nova/revisar" element={<FormacaoProtectedRoutes><FormacaoLayout><FormacaoAulaNovaRevisar /></FormacaoLayout></FormacaoProtectedRoutes>} />
      
      <Route path="/formacao/aulas/:id" element={<FormacaoProtectedRoutes><FormacaoLayout><FormacaoAulaDetalhes /></FormacaoLayout></FormacaoProtectedRoutes>} />
      <Route path="/formacao/materiais" element={<FormacaoProtectedRoutes><FormacaoLayout><div>Página de Materiais</div></FormacaoLayout></FormacaoProtectedRoutes>} />
      <Route path="/formacao/alunos" element={<FormacaoProtectedRoutes><FormacaoLayout><div>Página de Alunos</div></FormacaoLayout></FormacaoProtectedRoutes>} />
      <Route path="/formacao/configuracoes" element={<FormacaoProtectedRoutes><FormacaoLayout><div>Configurações do LMS</div></FormacaoLayout></FormacaoProtectedRoutes>} />
      
      {/* Fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

import OnboardingIntro from '@/pages/onboarding/OnboardingIntro';
import PersonalInfo from '@/pages/onboarding/steps/PersonalInfo';
import ProfessionalData from '@/pages/onboarding/steps/ProfessionalData';
import BusinessContext from '@/pages/onboarding/steps/BusinessContext';
import AIExperience from '@/pages/onboarding/steps/AIExperience';
import BusinessGoalsClub from '@/pages/onboarding/steps/BusinessGoalsClub';
import ExperiencePersonalization from '@/pages/onboarding/steps/ExperiencePersonalization';
import ComplementaryInfo from '@/pages/onboarding/steps/ComplementaryInfo';
import Review from '@/pages/onboarding/steps/Review';
import TrailGeneration from '@/pages/onboarding/steps/TrailGeneration';
import FormacaoDashboard from '@/pages/formacao/FormacaoDashboard';
import FormacaoCursos from '@/pages/formacao/FormacaoCursos';
import FormacaoCursoDetalhes from '@/pages/formacao/FormacaoCursoDetalhes';
import FormacaoModuloDetalhes from '@/pages/formacao/FormacaoModuloDetalhes';
import FormacaoAulas from '@/pages/formacao/FormacaoAulas';
import FormacaoAulaDetalhes from '@/pages/formacao/FormacaoAulaDetalhes';

export default AppRoutes;
