import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminProtectedRoutes } from '@/auth/AdminProtectedRoutes';
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import LoadingScreen from '@/components/common/LoadingSpinner';

// Layout Components - Carregados diretamente por serem críticos
import MemberLayout from '@/components/layout/MemberLayout';
import AdminLayout from '@/components/layout/admin/AdminLayout';

// Eager loading para páginas principais (alta frequência de acesso)
import Dashboard from '@/pages/member/Dashboard';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminTools from '@/pages/admin/AdminTools';
import Tools from '@/pages/member/Tools';

// Auth Pages - Carregados sob demanda, mas preparados antes
import { lazy, Suspense } from 'react';
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));
const SetNewPassword = lazy(() => import('@/pages/auth/SetNewPassword'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Páginas e componentes menos acessados - mantidos com lazy loading
const Profile = lazy(() => import('@/pages/member/Profile'));
const EditProfile = lazy(() => import('@/pages/member/EditProfile'));
const Solutions = lazy(() => import('@/pages/member/Solutions'));
const SolutionDetails = lazy(() => import('@/pages/member/SolutionDetails'));
const SolutionImplementation = lazy(() => import('@/pages/member/SolutionImplementation'));
const ImplementationCompleted = lazy(() => import('@/pages/member/ImplementationCompleted'));
const ImplementationTrailPage = lazy(() => import('@/pages/member/ImplementationTrailPage'));
const ToolDetails = lazy(() => import('@/pages/member/ToolDetails'));
const Benefits = lazy(() => import('@/pages/member/Benefits'));
const Achievements = lazy(() => import('@/pages/member/Achievements'));
const Suggestions = lazy(() => import('@/pages/member/Suggestions'));
const SuggestionDetails = lazy(() => import('@/pages/member/SuggestionDetails'));
const NewSuggestion = lazy(() => import('@/pages/member/NewSuggestion'));

// Onboarding - menos frequente, mantém lazy loading
const OnboardingIntro = lazy(() => import('@/pages/onboarding/OnboardingIntro'));
const PersonalInfo = lazy(() => import('@/pages/onboarding/steps/PersonalInfo'));
const ProfessionalData = lazy(() => import('@/pages/onboarding/steps/ProfessionalData'));
const BusinessContext = lazy(() => import('@/pages/onboarding/steps/BusinessContext'));
const AIExperience = lazy(() => import('@/pages/onboarding/steps/AIExperience'));
const BusinessGoalsClub = lazy(() => import('@/pages/onboarding/steps/BusinessGoalsClub'));
const ExperiencePersonalization = lazy(() => import('@/pages/onboarding/steps/ExperiencePersonalization'));
const ComplementaryInfo = lazy(() => import('@/pages/onboarding/steps/ComplementaryInfo'));
const Review = lazy(() => import('@/pages/onboarding/steps/Review'));
const TrailGeneration = lazy(() => import('@/pages/onboarding/steps/TrailGeneration'));

// Admin Pages secundárias - mantidas com lazy loading
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminSolutions = lazy(() => import('@/pages/admin/AdminSolutions'));
const AdminSolutionCreate = lazy(() => import('@/pages/admin/AdminSolutionCreate'));
const AdminSolutionEdit = lazy(() => import('@/pages/admin/AdminSolutionEdit'));
const AdminSolutionEditor = lazy(() => import('@/pages/admin/SolutionEditor'));
const AdminToolEdit = lazy(() => import('@/pages/admin/AdminToolEdit'));
const AdminSuggestions = lazy(() => import('@/pages/admin/AdminSuggestions'));
const AdminSuggestionDetails = lazy(() => import('@/pages/admin/AdminSuggestionDetails'));
const AdminOnboarding = lazy(() => import('@/pages/admin/AdminOnboarding'));
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'));

// Component Loader com fallback mais otimizado (aparecendo apenas após um delay mínimo)
const SuspenseLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={
    <div className="min-h-[200px] flex items-center justify-center">
      <LoadingScreen />
    </div>
  }>
    {children}
  </Suspense>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes - Sem layout ou proteção */}
      <Route path="/login" element={<SuspenseLoader><Login /></SuspenseLoader>} />
      <Route path="/register" element={<SuspenseLoader><Register /></SuspenseLoader>} />
      <Route path="/reset-password" element={<SuspenseLoader><ResetPassword /></SuspenseLoader>} />
      <Route path="/set-new-password" element={<SuspenseLoader><SetNewPassword /></SuspenseLoader>} />
      
      {/* Redirecionamento da raiz para dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Member Routes com Layout - Carregamento eager para Dashboard */}
      <Route path="/dashboard" element={
        <ProtectedRoutes>
          <MemberLayout>
            <Dashboard />
          </MemberLayout>
        </ProtectedRoutes>
      } />

      {/* Tools - Carregamento eager para melhor experiência */}
      <Route path="/tools" element={
        <ProtectedRoutes>
          <MemberLayout>
            <Tools />
          </MemberLayout>
        </ProtectedRoutes>
      } />

      {/* Rotas secundárias com lazy loading */}
      <Route path="/implementation-trail" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <MemberLayout>
              <ImplementationTrailPage />
            </MemberLayout>
          </SuspenseLoader>
        </ProtectedRoutes>
      } />

      {/* Rotas de Perfil */}
      <Route path="/profile" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <MemberLayout>
              <Profile />
            </MemberLayout>
          </SuspenseLoader>
        </ProtectedRoutes>
      } />
      
      <Route path="/profile/edit" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <MemberLayout>
              <EditProfile />
            </MemberLayout>
          </SuspenseLoader>
        </ProtectedRoutes>
      } />

      {/* Rotas de Soluções */}
      <Route path="/solutions" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <MemberLayout>
              <Solutions />
            </MemberLayout>
          </SuspenseLoader>
        </ProtectedRoutes>
      } />
      
      <Route path="/solution/:id" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <MemberLayout>
              <SolutionDetails />
            </MemberLayout>
          </SuspenseLoader>
        </ProtectedRoutes>
      } />
      
      <Route path="/implement/:id/:moduleIdx" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <MemberLayout>
              <SolutionImplementation />
            </MemberLayout>
          </SuspenseLoader>
        </ProtectedRoutes>
      } />
      
      <Route path="/implementation/:id" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <MemberLayout>
              <SolutionImplementation />
            </MemberLayout>
          </SuspenseLoader>
        </ProtectedRoutes>
      } />
      
      <Route path="/implementation/:id/:moduleIdx" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <MemberLayout>
              <SolutionImplementation />
            </MemberLayout>
          </SuspenseLoader>
        </ProtectedRoutes>
      } />
      
      <Route path="/implementation/completed/:id" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <MemberLayout>
              <ImplementationCompleted />
            </MemberLayout>
          </SuspenseLoader>
        </ProtectedRoutes>
      } />

      {/* Rotas de Ferramentas */}
      
      <Route path="/tools/:id" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <MemberLayout>
              <ToolDetails />
            </MemberLayout>
          </SuspenseLoader>
        </ProtectedRoutes>
      } />

      {/* Benefícios e Conquistas */}
      <Route path="/benefits" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <MemberLayout>
              <Benefits />
            </MemberLayout>
          </SuspenseLoader>
        </ProtectedRoutes>
      } />
      
      <Route path="/achievements" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <MemberLayout>
              <Achievements />
            </MemberLayout>
          </SuspenseLoader>
        </ProtectedRoutes>
      } />
      
      {/* Rotas de Sugestões */}
      <Route path="/suggestions" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <MemberLayout>
              <Suggestions />
            </MemberLayout>
          </SuspenseLoader>
        </ProtectedRoutes>
      } />
      
      <Route path="/suggestions/:id" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <MemberLayout>
              <SuggestionDetails />
            </MemberLayout>
          </SuspenseLoader>
        </ProtectedRoutes>
      } />
      
      <Route path="/suggestions/new" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <MemberLayout>
              <NewSuggestion />
            </MemberLayout>
          </SuspenseLoader>
        </ProtectedRoutes>
      } />
      
      {/* Rotas de Onboarding */}
      <Route path="/onboarding" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <OnboardingIntro />
          </SuspenseLoader>
        </ProtectedRoutes>
      } />
      
      <Route path="/onboarding/personal-info" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <PersonalInfo />
          </SuspenseLoader>
        </ProtectedRoutes>
      } />
      
      <Route path="/onboarding/professional-data" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <ProfessionalData />
          </SuspenseLoader>
        </ProtectedRoutes>
      } />
      
      <Route path="/onboarding/business-context" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <BusinessContext />
          </SuspenseLoader>
        </ProtectedRoutes>
      } />
      
      <Route path="/onboarding/ai-experience" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <AIExperience />
          </SuspenseLoader>
        </ProtectedRoutes>
      } />
      
      <Route path="/onboarding/club-goals" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <BusinessGoalsClub />
          </SuspenseLoader>
        </ProtectedRoutes>
      } />
      
      <Route path="/onboarding/customization" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <ExperiencePersonalization />
          </SuspenseLoader>
        </ProtectedRoutes>
      } />
      
      <Route path="/onboarding/complementary" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <ComplementaryInfo />
          </SuspenseLoader>
        </ProtectedRoutes>
      } />
      
      <Route path="/onboarding/review" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <Review />
          </SuspenseLoader>
        </ProtectedRoutes>
      } />
      
      <Route path="/onboarding/trail-generation" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <TrailGeneration />
          </SuspenseLoader>
        </ProtectedRoutes>
      } />
      
      {/* Rotas Admin - Eager loading para páginas principais */}
      <Route path="/admin" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <AdminDashboard />
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
      
      <Route path="/admin/users" element={
        <AdminProtectedRoutes>
          <SuspenseLoader>
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </SuspenseLoader>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/solutions" element={
        <AdminProtectedRoutes>
          <SuspenseLoader>
            <AdminLayout>
              <AdminSolutions />
            </AdminLayout>
          </SuspenseLoader>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/solutions/new" element={
        <AdminProtectedRoutes>
          <SuspenseLoader>
            <AdminLayout>
              <AdminSolutionCreate />
            </AdminLayout>
          </SuspenseLoader>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/solutions/:id" element={
        <AdminProtectedRoutes>
          <SuspenseLoader>
            <AdminLayout>
              <AdminSolutionEdit />
            </AdminLayout>
          </SuspenseLoader>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/solutions/:id/editor" element={
        <AdminProtectedRoutes>
          <SuspenseLoader>
            <AdminLayout>
              <AdminSolutionEditor />
            </AdminLayout>
          </SuspenseLoader>
        </AdminProtectedRoutes>
      } />
      
      
      <Route path="/admin/tools/new" element={
        <AdminProtectedRoutes>
          <SuspenseLoader>
            <AdminLayout>
              <AdminToolEdit />
            </AdminLayout>
          </SuspenseLoader>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/tools/:id" element={
        <AdminProtectedRoutes>
          <SuspenseLoader>
            <AdminLayout>
              <AdminToolEdit />
            </AdminLayout>
          </SuspenseLoader>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/suggestions" element={
        <AdminProtectedRoutes>
          <SuspenseLoader>
            <AdminLayout>
              <AdminSuggestions />
            </AdminLayout>
          </SuspenseLoader>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/suggestions/:id" element={
        <AdminProtectedRoutes>
          <SuspenseLoader>
            <AdminLayout>
              <AdminSuggestionDetails />
            </AdminLayout>
          </SuspenseLoader>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/onboarding" element={
        <AdminProtectedRoutes>
          <SuspenseLoader>
            <AdminLayout>
              <AdminOnboarding />
            </AdminLayout>
          </SuspenseLoader>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/analytics" element={
        <AdminProtectedRoutes>
          <SuspenseLoader>
            <AdminLayout>
              <AdminAnalytics />
            </AdminLayout>
          </SuspenseLoader>
        </AdminProtectedRoutes>
      } />
      
      {/* Fallback para rotas não encontradas */}
      <Route path="*" element={<SuspenseLoader><NotFound /></SuspenseLoader>} />
    </Routes>
  );
};

export default AppRoutes;
