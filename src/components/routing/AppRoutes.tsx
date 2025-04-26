
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminProtectedRoutes } from '@/auth/AdminProtectedRoutes';
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import LoadingScreen from '@/components/common/LoadingSpinner';

// Component Loader com fallback consistente
const SuspenseLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
);

// Layout Components - Carregados antecipadamente pois são frequentemente usados
const MemberLayout = lazy(() => import('@/components/layout/MemberLayout'));
const AdminLayout = lazy(() => import('@/components/layout/admin/AdminLayout'));

// Auth Pages - Prioritários no carregamento
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));
const SetNewPassword = lazy(() => import('@/pages/auth/SetNewPassword'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Member Pages - Agrupados por funcionalidade para melhor code splitting
const Dashboard = lazy(() => import('@/pages/member/Dashboard'));
const Profile = lazy(() => import('@/pages/member/Profile'));
const EditProfile = lazy(() => import('@/pages/member/EditProfile'));

// Solution Related Pages
const Solutions = lazy(() => import('@/pages/member/Solutions'));
const SolutionDetails = lazy(() => import('@/pages/member/SolutionDetails'));
const SolutionImplementation = lazy(() => import('@/pages/member/SolutionImplementation'));
const ImplementationCompleted = lazy(() => import('@/pages/member/ImplementationCompleted'));
const ImplementationTrailPage = lazy(() => import('@/pages/member/ImplementationTrailPage'));

// Tools Related Pages
const Tools = lazy(() => import('@/pages/member/Tools'));
const ToolDetails = lazy(() => import('@/pages/member/ToolDetails'));

// Benefits & Achievements
const Benefits = lazy(() => import('@/pages/member/Benefits'));
const Achievements = lazy(() => import('@/pages/member/Achievements'));

// Suggestions Related Pages
const Suggestions = lazy(() => import('@/pages/member/Suggestions'));
const SuggestionDetails = lazy(() => import('@/pages/member/SuggestionDetails'));
const NewSuggestion = lazy(() => import('@/pages/member/NewSuggestion'));

// Onboarding Pages
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

// Admin Pages - Carregados apenas quando necessário
const AdminPages = {
  Dashboard: lazy(() => import('@/pages/admin/AdminDashboard')),
  Users: lazy(() => import('@/pages/admin/AdminUsers')),
  Solutions: lazy(() => import('@/pages/admin/AdminSolutions')),
  SolutionCreate: lazy(() => import('@/pages/admin/AdminSolutionCreate')),
  SolutionEdit: lazy(() => import('@/pages/admin/AdminSolutionEdit')),
  SolutionEditor: lazy(() => import('@/pages/admin/SolutionEditor')),
  Tools: lazy(() => import('@/pages/admin/AdminTools')),
  ToolEdit: lazy(() => import('@/pages/admin/AdminToolEdit')),
  Suggestions: lazy(() => import('@/pages/admin/AdminSuggestions')),
  SuggestionDetails: lazy(() => import('@/pages/admin/AdminSuggestionDetails')),
  Onboarding: lazy(() => import('@/pages/admin/AdminOnboarding')),
  Analytics: lazy(() => import('@/pages/admin/AdminAnalytics'))
};

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

      {/* Member Routes com Layout */}
      <Route path="/dashboard" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <MemberLayout>
              <Dashboard />
            </MemberLayout>
          </SuspenseLoader>
        </ProtectedRoutes>
      } />

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
      <Route path="/tools" element={
        <ProtectedRoutes>
          <SuspenseLoader>
            <MemberLayout>
              <Tools />
            </MemberLayout>
          </SuspenseLoader>
        </ProtectedRoutes>
      } />
      
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
      
      {/* Rotas Admin - Agrupadas e com lazy loading específico */}
      <Route path="/admin" element={
        <AdminProtectedRoutes>
          <SuspenseLoader>
            <AdminLayout>
              <AdminPages.Dashboard />
            </AdminLayout>
          </SuspenseLoader>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/users" element={
        <AdminProtectedRoutes>
          <SuspenseLoader>
            <AdminLayout>
              <AdminPages.Users />
            </AdminLayout>
          </SuspenseLoader>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/solutions" element={
        <AdminProtectedRoutes>
          <SuspenseLoader>
            <AdminLayout>
              <AdminPages.Solutions />
            </AdminLayout>
          </SuspenseLoader>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/solutions/new" element={
        <AdminProtectedRoutes>
          <SuspenseLoader>
            <AdminLayout>
              <AdminPages.SolutionCreate />
            </AdminLayout>
          </SuspenseLoader>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/solutions/:id" element={
        <AdminProtectedRoutes>
          <SuspenseLoader>
            <AdminLayout>
              <AdminPages.SolutionEdit />
            </AdminLayout>
          </SuspenseLoader>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/solutions/:id/editor" element={
        <AdminProtectedRoutes>
          <SuspenseLoader>
            <AdminLayout>
              <AdminPages.SolutionEditor />
            </AdminLayout>
          </SuspenseLoader>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/tools" element={
        <AdminProtectedRoutes>
          <SuspenseLoader>
            <AdminLayout>
              <AdminPages.Tools />
            </AdminLayout>
          </SuspenseLoader>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/tools/new" element={
        <AdminProtectedRoutes>
          <SuspenseLoader>
            <AdminLayout>
              <AdminPages.ToolEdit />
            </AdminLayout>
          </SuspenseLoader>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/tools/:id" element={
        <AdminProtectedRoutes>
          <SuspenseLoader>
            <AdminLayout>
              <AdminPages.ToolEdit />
            </AdminLayout>
          </SuspenseLoader>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/suggestions" element={
        <AdminProtectedRoutes>
          <SuspenseLoader>
            <AdminLayout>
              <AdminPages.Suggestions />
            </AdminLayout>
          </SuspenseLoader>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/suggestions/:id" element={
        <AdminProtectedRoutes>
          <SuspenseLoader>
            <AdminLayout>
              <AdminPages.SuggestionDetails />
            </AdminLayout>
          </SuspenseLoader>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/onboarding" element={
        <AdminProtectedRoutes>
          <SuspenseLoader>
            <AdminLayout>
              <AdminPages.Onboarding />
            </AdminLayout>
          </SuspenseLoader>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/analytics" element={
        <AdminProtectedRoutes>
          <SuspenseLoader>
            <AdminLayout>
              <AdminPages.Analytics />
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
