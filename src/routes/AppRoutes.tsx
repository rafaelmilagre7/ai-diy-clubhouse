
import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { SmartRedirect } from '@/components/routing/SmartRedirect';
import { SimpleProtectedRoutes } from '@/auth/SimpleProtectedRoutes';

// Auth pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const SetNewPasswordPage = lazy(() => import('@/pages/auth/SetNewPasswordPage'));
const OnboardingPage = lazy(() => import('@/pages/auth/OnboardingPage'));

// Member pages  
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const Profile = lazy(() => import('@/pages/member/Profile'));
const SolutionDetail = lazy(() => import('@/pages/member/SolutionDetail'));
const Suggestions = lazy(() => import('@/pages/member/Suggestions'));
const SuggestionDetail = lazy(() => import('@/pages/member/SuggestionDetail'));
const ToolDetail = lazy(() => import('@/pages/member/ToolDetail'));
const Learning = lazy(() => import('@/pages/member/Learning'));
const LearningCourse = lazy(() => import('@/pages/member/LearningCourse'));
const LearningLesson = lazy(() => import('@/pages/member/LearningLesson'));
const LearningCertificates = lazy(() => import('@/pages/member/LearningCertificates'));
const Events = lazy(() => import('@/pages/member/Events'));
const Benefits = lazy(() => import('@/pages/member/Benefits'));

// Admin pages
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminUserDetail = lazy(() => import('@/pages/admin/AdminUserDetail'));
const AdminSolutions = lazy(() => import('@/pages/admin/AdminSolutions'));
const AdminSuggestions = lazy(() => import('@/pages/admin/AdminSuggestions'));
const AdminSolutionEditor = lazy(() => import('@/pages/admin/AdminSolutionEditor'));

// Formacao pages
const FormacaoAulas = lazy(() => import('@/pages/formacao/FormacaoAulas'));

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<SmartRedirect />} />

      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/set-new-password" element={<SetNewPasswordPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Protected routes */}
      <Route element={<SimpleProtectedRoutes />}>
        {/* Member routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/*" element={<Profile />} />
        <Route path="/solution/:id" element={<SolutionDetail />} />
        <Route path="/suggestions" element={<Suggestions />} />
        <Route path="/suggestions/:id" element={<SuggestionDetail />} />
        <Route path="/tool/:id" element={<ToolDetail />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/learning/course/:id" element={<LearningCourse />} />
        <Route path="/learning/lesson/:id" element={<LearningLesson />} />
        <Route path="/learning/certificates" element={<LearningCertificates />} />
        <Route path="/events" element={<Events />} />
        <Route path="/benefits" element={<Benefits />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/users/:id" element={<AdminUserDetail />} />
        <Route path="/admin/solutions" element={<AdminSolutions />} />
        <Route path="/admin/solutions/:id" element={<AdminSolutionEditor />} />
        <Route path="/admin/suggestions" element={<AdminSuggestions />} />

        {/* Formacao routes */}
        <Route path="/formacao" element={<FormacaoAulas />} />
        <Route path="/formacao/aulas" element={<FormacaoAulas />} />
      </Route>
    </Routes>
  );
};
