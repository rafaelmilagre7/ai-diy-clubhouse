
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AdminProtectedRoutes } from '@/auth/AdminProtectedRoutes';
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';

// Layout Components
import MemberLayout from '@/components/layout/MemberLayout';
import AdminLayout from '@/components/layout/admin/AdminLayout';

// Todas as páginas carregadas estaticamente
import Dashboard from '@/pages/member/Dashboard';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminTools from '@/pages/admin/AdminTools';
import Tools from '@/pages/member/Tools';
import Profile from '@/pages/member/Profile';
import Solutions from '@/pages/member/Solutions';
import SolutionDetails from '@/pages/member/SolutionDetails';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ResetPassword from '@/pages/auth/ResetPassword';
import SetNewPassword from '@/pages/auth/SetNewPassword';
import NotFound from '@/pages/NotFound';
import EditProfile from '@/pages/member/EditProfile';
import SolutionImplementation from '@/pages/member/SolutionImplementation';
import ImplementationCompleted from '@/pages/member/ImplementationCompleted';
import ImplementationTrailPage from '@/pages/member/ImplementationTrailPage';
import SuggestionsPage from '@/pages/member/Suggestions';
import AdminSuggestions from '@/pages/admin/AdminSuggestions';
import AdminSuggestionDetails from '@/pages/admin/AdminSuggestionDetails';
import Onboarding from '@/pages/onboarding/Onboarding';
import OnboardingIntro from '@/pages/onboarding/OnboardingIntro';
import Review from '@/pages/onboarding/Review';
import Achievements from '@/pages/member/Achievements';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminSolutions from '@/pages/admin/AdminSolutions';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminSettings from '@/pages/admin/AdminSettings';
import PersonalInfo from '@/pages/onboarding/steps/PersonalInfo';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/set-new-password" element={<SetNewPassword />} />
      
      {/* Rotas protegidas para membros */}
      <Route path="/" element={
        <ProtectedRoutes>
          <MemberLayout>
            <Outlet />
          </MemberLayout>
        </ProtectedRoutes>
      }>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="edit-profile" element={<EditProfile />} />
        <Route path="tools" element={<Tools />} />
        <Route path="solutions" element={<Solutions />} />
        <Route path="solution/:id" element={<SolutionDetails />} />
        <Route path="suggestions" element={<SuggestionsPage />} />
        <Route path="implementation-trail" element={<ImplementationTrailPage />} />
        <Route path="solution/:id/implementation/:moduleId" element={<SolutionImplementation />} />
        <Route path="solution/:id/completed" element={<ImplementationCompleted />} />
        <Route path="achievements" element={<Achievements />} />
        
        {/* Rotas de Onboarding */}
        <Route path="onboarding" element={<OnboardingIntro />} />
        <Route path="onboarding/personal-info" element={<PersonalInfo />} />
        <Route path="onboarding/personal-data" element={<Onboarding />} />
        <Route path="onboarding/professional-data" element={<Onboarding />} />
        <Route path="onboarding/business-context" element={<Onboarding />} />
        <Route path="onboarding/ai-experience" element={<Onboarding />} />
        <Route path="onboarding/business-goals" element={<Onboarding />} />
        <Route path="onboarding/experience-personalization" element={<Onboarding />} />
        <Route path="onboarding/complementary" element={<Onboarding />} />
        <Route path="onboarding/review" element={<Review />} />
      </Route>
      
      {/* Rotas protegidas para admins */}
      <Route path="/admin" element={
        <AdminProtectedRoutes>
          <AdminLayout>
            <Outlet />
          </AdminLayout>
        </AdminProtectedRoutes>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="tools" element={<AdminTools />} />
        <Route path="suggestions" element={<AdminSuggestions />} />
        <Route path="suggestions/:id" element={<AdminSuggestionDetails />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="solutions" element={<AdminSolutions />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      
      {/* Rota 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
