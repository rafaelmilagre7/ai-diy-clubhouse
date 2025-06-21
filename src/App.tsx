import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import Dashboard from '@/pages/Dashboard';
import OnboardingPage from '@/pages/OnboardingPage';
import SuggestionsPage from '@/pages/SuggestionsPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminSuggestionsPage from '@/pages/admin/AdminSuggestionsPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminInvitesPage from '@/pages/admin/AdminInvitesPage';
import AdminEventsPage from '@/pages/admin/AdminEventsPage';
import AdminLearningPage from '@/pages/admin/AdminLearningPage';
import AdminContentSuggestionsPage from '@/pages/admin/AdminContentSuggestionsPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';
import RootRedirect from '@/components/routing/RootRedirect';
import AuthLayout from '@/components/auth/AuthLayout';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import SetNewPasswordForm from '@/components/auth/SetNewPasswordForm';
import { Forum } from '@/components/forum/Forum';
import { ForumTopic } from '@/components/forum/ForumTopic';
import { LearningHome } from '@/components/learning/LearningHome';
import { LearningTopic } from '@/components/learning/LearningTopic';
import { LearningLesson } from '@/components/learning/LearningLesson';
import { EventsHome } from '@/components/events/EventsHome';
import { EventDetails } from '@/components/events/EventDetails';
import { NotFound } from '@/components/common/NotFound';
import { PricingPage } from '@/pages/PricingPage';
import { TermsOfServicePage } from '@/pages/TermsOfServicePage';
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage';
import { ContactPage } from '@/pages/ContactPage';
import { useToast } from "@/hooks/use-toast"
import { Toast } from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"
import { AnalyticsDashboard } from '@/pages/admin/AnalyticsDashboard';
import { FormacaoPage } from '@/pages/FormacaoPage';
import EnhancedInviteRegistration from "@/components/auth/EnhancedInviteRegistration";

function App() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast()

  useEffect(() => {
    if (authLoading) {
      console.log('[APP] Autenticação ainda carregando...');
    } else if (user) {
      console.log('[APP] Usuário autenticado:', user.email);
    } else {
      console.log('[APP] Nenhum usuário autenticado.');
    }
  }, [user, authLoading]);

  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<AuthLayout />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        <Route path="/set-password" element={<SetNewPasswordForm />} />
        
        {/* Enhanced invite registration route */}
        <Route path="/register/:token" element={<EnhancedInviteRegistration />} />
        
        {/* Public routes */}
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* App routes - protected by RootRedirect */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/suggestions" element={<SuggestionsPage />} />
        
        {/* Formacao Page */}
        <Route path="/formacao" element={<FormacaoPage />} />

        {/* Learning routes */}
        <Route path="/learning" element={<LearningHome />} />
        <Route path="/learning/topic/:topicId" element={<LearningTopic />} />
        <Route path="/learning/lesson/:lessonId" element={<LearningLesson />} />

        {/* Events routes */}
        <Route path="/events" element={<EventsHome />} />
        <Route path="/events/:eventId" element={<EventDetails />} />

        {/* Forum routes */}
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/topic/:topicId" element={<ForumTopic />} />

        {/* Admin routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
         <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
        <Route path="/admin/suggestions" element={<AdminSuggestionsPage />} />
        <Route path="/admin/content-suggestions" element={<AdminContentSuggestionsPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/invites" element={<AdminInvitesPage />} />
        <Route path="/admin/events" element={<AdminEventsPage />} />
        <Route path="/admin/learning" element={<AdminLearningPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />

        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
