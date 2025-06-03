
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import LoadingScreen from '@/components/common/LoadingScreen';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminSolutions from '@/pages/admin/AdminSolutions';
import AdminSolutionCreate from '@/pages/admin/AdminSolutionCreate';
import AdminSuggestions from '@/pages/admin/AdminSuggestions';
import AdminSuggestionDetails from '@/pages/admin/AdminSuggestionDetails';
import AdminTools from '@/pages/admin/AdminTools';
import AdminOnboarding from '@/pages/admin/AdminOnboarding';
import AdminOnboardingReset from '@/pages/admin/AdminOnboardingReset';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import CommunityModerationPage from '@/pages/admin/community/CommunityModerationPage';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminRoles from '@/pages/admin/AdminRoles';
import InvitesManagement from '@/pages/admin/invites';

export const AdminRoutes = () => {
  return (
    <Suspense fallback={<LoadingScreen message="Carregando painel administrativo..." />}>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="solutions" element={<AdminSolutions />} />
        <Route path="solutions/create" element={<AdminSolutionCreate />} />
        <Route path="suggestions" element={<AdminSuggestions />} />
        <Route path="suggestions/:id" element={<AdminSuggestionDetails />} />
        <Route path="tools" element={<AdminTools />} />
        <Route path="onboarding" element={<AdminOnboarding />} />
        <Route path="onboarding/reset" element={<AdminOnboardingReset />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="community" element={<CommunityModerationPage />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="roles" element={<AdminRoles />} />
        <Route path="invites" element={<InvitesManagement />} />
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;
