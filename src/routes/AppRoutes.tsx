
import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { SmartRedirect } from '@/components/routing/SmartRedirect';
import { SimpleProtectedRoutes } from '@/auth/SimpleProtectedRoutes';
import MemberLayout from '@/components/layout/MemberLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import FormacaoLayout from '@/components/layout/FormacaoLayout';
import LoadingScreen from '@/components/common/LoadingScreen';

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
    <Suspense fallback={<LoadingScreen message="Carregando aplicação..." />}>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<SmartRedirect />} />

        {/* Auth routes - sem layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/set-new-password" element={<SetNewPasswordPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Protected routes */}
        <Route element={<SimpleProtectedRoutes />}>
          {/* Member routes com MemberLayout */}
          <Route path="/dashboard" element={<MemberLayout><DashboardPage /></MemberLayout>} />
          <Route path="/profile" element={<MemberLayout><Profile /></MemberLayout>} />
          <Route path="/profile/*" element={<MemberLayout><Profile /></MemberLayout>} />
          <Route path="/solution/:id" element={<MemberLayout><SolutionDetail /></MemberLayout>} />
          <Route path="/suggestions" element={<MemberLayout><Suggestions /></MemberLayout>} />
          <Route path="/suggestions/:id" element={<MemberLayout><SuggestionDetail /></MemberLayout>} />
          <Route path="/tool/:id" element={<MemberLayout><ToolDetail /></MemberLayout>} />
          <Route path="/learning" element={<MemberLayout><Learning /></MemberLayout>} />
          <Route path="/learning/course/:id" element={<MemberLayout><LearningCourse /></MemberLayout>} />
          <Route path="/learning/lesson/:id" element={<MemberLayout><LearningLesson /></MemberLayout>} />
          <Route path="/learning/certificates" element={<MemberLayout><LearningCertificates /></MemberLayout>} />
          <Route path="/events" element={<MemberLayout><Events /></MemberLayout>} />
          <Route path="/benefits" element={<MemberLayout><Benefits /></MemberLayout>} />

          {/* Admin routes com AdminLayout */}
          <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
          <Route path="/admin/users/:id" element={<AdminLayout><AdminUserDetail /></AdminLayout>} />
          <Route path="/admin/solutions" element={<AdminLayout><AdminSolutions /></AdminLayout>} />
          <Route path="/admin/solutions/:id" element={<AdminLayout><AdminSolutionEditor /></AdminLayout>} />
          <Route path="/admin/suggestions" element={<AdminLayout><AdminSuggestions /></AdminLayout>} />

          {/* Formacao routes com FormacaoLayout */}
          <Route path="/formacao" element={<FormacaoLayout><FormacaoAulas /></FormacaoLayout>} />
          <Route path="/formacao/aulas" element={<FormacaoLayout><FormacaoAulas /></FormacaoLayout>} />
        </Route>
      </Routes>
    </Suspense>
  );
};
