
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import LoadingScreen from '@/components/common/LoadingScreen';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminSolutions from '@/pages/admin/AdminSolutions';
import AdminSolutionEditor from '@/pages/admin/AdminSolutionEditor';
import AdminSolutionCreate from '@/pages/admin/AdminSolutionCreate';
import AdminSuggestions from '@/pages/admin/AdminSuggestions';
import AdminSuggestionDetails from '@/pages/admin/AdminSuggestionDetails';
import AdminTools from '@/pages/admin/AdminTools';
import AdminOnboarding from '@/pages/admin/AdminOnboarding';
import AdminOnboardingReset from '@/pages/admin/AdminOnboardingReset';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminCommunityModeration from '@/pages/admin/AdminCommunityModeration';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminPerformance from '@/pages/admin/AdminPerformance';
import AdminRoles from '@/pages/admin/AdminRoles';
import AdminInvites from '@/pages/admin/AdminInvites';
import AdminPermissionsAudit from '@/pages/admin/AdminPermissionsAudit';

export const AdminRoutes = () => {
  return (
    <Suspense fallback={<LoadingScreen message="Carregando painel administrativo..." />}>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="solutions" element={<AdminSolutions />} />
        <Route path="solutions/create" element={<AdminSolutionCreate />} />
        <Route path="solutions/:id/edit" element={<AdminSolutionEditor />} />
        <Route path="suggestions" element={<AdminSuggestions />} />
        <Route path="suggestions/:id" element={<AdminSuggestionDetails />} />
        <Route path="tools" element={<AdminTools />} />
        <Route path="onboarding" element={<AdminOnboarding />} />
        <Route path="onboarding/reset" element={<AdminOnboardingReset />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="community" element={<AdminCommunityModeration />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="performance" element={<AdminPerformance />} />
        <Route path="roles" element={<AdminRoles />} />
        <Route path="invites" element={<AdminInvites />} />
        <Route path="permissions/audit" element={<AdminPermissionsAudit />} />
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;
