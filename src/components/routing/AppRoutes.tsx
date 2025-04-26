import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminProtectedRoutes } from '@/auth/AdminProtectedRoutes';
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import { Skeleton } from "@/components/ui/skeleton";

// Layout Components - Carregados diretamente por serem críticos
import MemberLayout from '@/components/layout/MemberLayout';
import AdminLayout from '@/components/layout/admin/AdminLayout';

// Eager loading para páginas principais (alta frequência de acesso)
import Dashboard from '@/pages/member/Dashboard';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminTools from '@/pages/admin/AdminTools';
import Tools from '@/pages/member/Tools';
import Profile from '@/pages/member/Profile';
import Solutions from '@/pages/member/Solutions';
import SolutionDetails from '@/pages/member/SolutionDetails';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';

// Páginas e componentes menos acessados - mantidos com lazy loading
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));
const SetNewPassword = lazy(() => import('@/pages/auth/SetNewPassword'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const EditProfile = lazy(() => import('@/pages/member/EditProfile'));
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

// Componente de carregamento otimista que não bloqueia a interface
const OptimisticLoading = ({ children }: { children: React.ReactNode }) => (
  <React.Suspense fallback={
    <div className="min-h-[200px] animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <Skeleton className="h-40 w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  }>
    {children}
  </React.Suspense>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes - Sem layout ou proteção */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<OptimisticLoading><ResetPassword /></OptimisticLoading>} />
      <Route path="/set-new-password" element={<OptimisticLoading><SetNewPassword /></OptimisticLoading>} />
      
      {/* Redirecionamento da raiz para dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Member Routes - Carregamento eager para páginas principais */}
      <Route path="/dashboard" element={
        <ProtectedRoutes>
          <MemberLayout>
            <Dashboard />
          </MemberLayout>
        </ProtectedRoutes>
      } />

      <Route path="/solutions" element={
        <ProtectedRoutes>
          <MemberLayout>
            <Solutions />
          </MemberLayout>
        </ProtectedRoutes>
      } />

      <Route path="/tools" element={
        <ProtectedRoutes>
          <MemberLayout>
            <Tools />
          </MemberLayout>
        </ProtectedRoutes>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoutes>
          <MemberLayout>
            <Profile />
          </MemberLayout>
        </ProtectedRoutes>
      } />

      <Route path="/solution/:id" element={
        <ProtectedRoutes>
          <MemberLayout>
            <SolutionDetails />
          </MemberLayout>
        </ProtectedRoutes>
      } />

      {/* Rotas secundárias com lazy loading e carregamento otimista */}
      <Route path="/implementation-trail" element={
        <ProtectedRoutes>
          <MemberLayout>
            <OptimisticLoading>
              <ImplementationTrailPage />
            </OptimisticLoading>
          </MemberLayout>
        </ProtectedRoutes>
      } />
      
      <Route path="/profile/edit" element={
        <ProtectedRoutes>
          <MemberLayout>
            <OptimisticLoading>
              <EditProfile />
            </OptimisticLoading>
          </MemberLayout>
        </ProtectedRoutes>
      } />
      
      <Route path="/implement/:id/:moduleIdx" element={
        <ProtectedRoutes>
          <MemberLayout>
            <OptimisticLoading>
              <SolutionImplementation />
            </OptimisticLoading>
          </MemberLayout>
        </ProtectedRoutes>
      } />
      
      <Route path="/implementation/:id" element={
        <ProtectedRoutes>
          <MemberLayout>
            <OptimisticLoading>
              <SolutionImplementation />
            </OptimisticLoading>
          </MemberLayout>
        </ProtectedRoutes>
      } />
      
      <Route path="/implementation/:id/:moduleIdx" element={
        <ProtectedRoutes>
          <MemberLayout>
            <OptimisticLoading>
              <SolutionImplementation />
            </OptimisticLoading>
          </MemberLayout>
        </ProtectedRoutes>
      } />
      
      <Route path="/implementation/completed/:id" element={
        <ProtectedRoutes>
          <MemberLayout>
            <OptimisticLoading>
              <ImplementationCompleted />
            </OptimisticLoading>
          </MemberLayout>
        </ProtectedRoutes>
      } />

      {/* Rotas de Ferramentas */}      
      <Route path="/tools/:id" element={
        <ProtectedRoutes>
          <MemberLayout>
            <OptimisticLoading>
              <ToolDetails />
            </OptimisticLoading>
          </MemberLayout>
        </ProtectedRoutes>
      } />

      {/* Benefícios e Conquistas */}
      <Route path="/benefits" element={
        <ProtectedRoutes>
          <MemberLayout>
            <OptimisticLoading>
              <Benefits />
            </OptimisticLoading>
          </MemberLayout>
        </ProtectedRoutes>
      } />
      
      <Route path="/achievements" element={
        <ProtectedRoutes>
          <MemberLayout>
            <OptimisticLoading>
              <Achievements />
            </OptimisticLoading>
          </MemberLayout>
        </ProtectedRoutes>
      } />
      
      {/* Rotas de Sugestões */}
      <Route path="/suggestions" element={
        <ProtectedRoutes>
          <MemberLayout>
            <OptimisticLoading>
              <Suggestions />
            </OptimisticLoading>
          </MemberLayout>
        </ProtectedRoutes>
      } />
      
      <Route path="/suggestions/:id" element={
        <ProtectedRoutes>
          <MemberLayout>
            <OptimisticLoading>
              <SuggestionDetails />
            </OptimisticLoading>
          </MemberLayout>
        </ProtectedRoutes>
      } />
      
      <Route path="/suggestions/new" element={
        <ProtectedRoutes>
          <MemberLayout>
            <OptimisticLoading>
              <NewSuggestion />
            </OptimisticLoading>
          </MemberLayout>
        </ProtectedRoutes>
      } />
      
      {/* Rotas de Onboarding */}
      <Route path="/onboarding" element={
        <ProtectedRoutes>
          <OptimisticLoading>
            <OnboardingIntro />
          </OptimisticLoading>
        </ProtectedRoutes>
      } />
      
      <Route path="/onboarding/personal-info" element={
        <ProtectedRoutes>
          <OptimisticLoading>
            <PersonalInfo />
          </OptimisticLoading>
        </ProtectedRoutes>
      } />
      
      <Route path="/onboarding/professional-data" element={
        <ProtectedRoutes>
          <OptimisticLoading>
            <ProfessionalData />
          </OptimisticLoading>
        </ProtectedRoutes>
      } />
      
      <Route path="/onboarding/business-context" element={
        <ProtectedRoutes>
          <OptimisticLoading>
            <BusinessContext />
          </OptimisticLoading>
        </ProtectedRoutes>
      } />
      
      <Route path="/onboarding/ai-experience" element={
        <ProtectedRoutes>
          <OptimisticLoading>
            <AIExperience />
          </OptimisticLoading>
        </ProtectedRoutes>
      } />
      
      <Route path="/onboarding/club-goals" element={
        <ProtectedRoutes>
          <OptimisticLoading>
            <BusinessGoalsClub />
          </OptimisticLoading>
        </ProtectedRoutes>
      } />
      
      <Route path="/onboarding/customization" element={
        <ProtectedRoutes>
          <OptimisticLoading>
            <ExperiencePersonalization />
          </OptimisticLoading>
        </ProtectedRoutes>
      } />
      
      <Route path="/onboarding/complementary" element={
        <ProtectedRoutes>
          <OptimisticLoading>
            <ComplementaryInfo />
          </OptimisticLoading>
        </ProtectedRoutes>
      } />
      
      <Route path="/onboarding/review" element={
        <ProtectedRoutes>
          <OptimisticLoading>
            <Review />
          </OptimisticLoading>
        </ProtectedRoutes>
      } />
      
      <Route path="/onboarding/trail-generation" element={
        <ProtectedRoutes>
          <OptimisticLoading>
            <TrailGeneration />
          </OptimisticLoading>
        </ProtectedRoutes>
      } />
      
      {/* Admin Routes */}
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
          <OptimisticLoading>
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </OptimisticLoading>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/solutions" element={
        <AdminProtectedRoutes>
          <OptimisticLoading>
            <AdminLayout>
              <AdminSolutions />
            </AdminLayout>
          </OptimisticLoading>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/solutions/new" element={
        <AdminProtectedRoutes>
          <OptimisticLoading>
            <AdminLayout>
              <AdminSolutionCreate />
            </AdminLayout>
          </OptimisticLoading>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/solutions/:id" element={
        <AdminProtectedRoutes>
          <OptimisticLoading>
            <AdminLayout>
              <AdminSolutionEdit />
            </AdminLayout>
          </OptimisticLoading>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/solutions/:id/editor" element={
        <AdminProtectedRoutes>
          <OptimisticLoading>
            <AdminLayout>
              <AdminSolutionEditor />
            </AdminLayout>
          </OptimisticLoading>
        </AdminProtectedRoutes>
      } />
      
      
      <Route path="/admin/tools/new" element={
        <AdminProtectedRoutes>
          <OptimisticLoading>
            <AdminLayout>
              <AdminToolEdit />
            </AdminLayout>
          </OptimisticLoading>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/tools/:id" element={
        <AdminProtectedRoutes>
          <OptimisticLoading>
            <AdminLayout>
              <AdminToolEdit />
            </AdminLayout>
          </OptimisticLoading>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/suggestions" element={
        <AdminProtectedRoutes>
          <OptimisticLoading>
            <AdminLayout>
              <AdminSuggestions />
            </AdminLayout>
          </OptimisticLoading>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/suggestions/:id" element={
        <AdminProtectedRoutes>
          <OptimisticLoading>
            <AdminLayout>
              <AdminSuggestionDetails />
            </AdminLayout>
          </OptimisticLoading>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/onboarding" element={
        <AdminProtectedRoutes>
          <OptimisticLoading>
            <AdminLayout>
              <AdminOnboarding />
            </AdminLayout>
          </OptimisticLoading>
        </AdminProtectedRoutes>
      } />
      
      <Route path="/admin/analytics" element={
        <AdminProtectedRoutes>
          <OptimisticLoading>
            <AdminLayout>
              <AdminAnalytics />
            </AdminLayout>
          </OptimisticLoading>
        </AdminProtectedRoutes>
      } />
      
      {/* Fallback para rotas não encontradas */}
      <Route path="*" element={<OptimisticLoading><NotFound /></OptimisticLoading>} />
    </Routes>
  );
};

export default AppRoutes;
