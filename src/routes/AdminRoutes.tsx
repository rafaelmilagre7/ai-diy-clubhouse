
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import OptimizedAdminDashboard from '@/pages/admin/OptimizedAdminDashboard';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminSolutions from '@/pages/admin/AdminSolutions';
import AdminTools from '@/pages/admin/AdminTools';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminRoles from '@/pages/admin/AdminRoles';
import AdminOnboarding from '@/pages/admin/AdminOnboarding';
import AdminOnboardingReset from '@/pages/admin/AdminOnboardingReset';
import InvitesManagement from '@/pages/admin/invites/InvitesManagement';
import CommunityModerationPage from '@/pages/admin/community/CommunityModerationPage';
import SupabaseDiagnostics from '@/pages/admin/SupabaseDiagnostics';

export const AdminRoutes = () => {
  return (
    <Routes>
      <Route index element={
        <AdminLayout>
          <OptimizedAdminDashboard />
        </AdminLayout>
      } />
      
      <Route path="users" element={
        <AdminLayout>
          <AdminUsers />
        </AdminLayout>
      } />
      
      <Route path="solutions" element={
        <AdminLayout>
          <AdminSolutions />
        </AdminLayout>
      } />
      
      <Route path="tools" element={
        <AdminLayout>
          <AdminTools />
        </AdminLayout>
      } />
      
      <Route path="events" element={
        <AdminLayout>
          <AdminEvents />
        </AdminLayout>
      } />
      
      <Route path="roles" element={
        <AdminLayout>
          <AdminRoles />
        </AdminLayout>
      } />
      
      <Route path="onboarding" element={
        <AdminLayout>
          <AdminOnboarding />
        </AdminLayout>
      } />
      
      <Route path="onboarding-reset" element={
        <AdminLayout>
          <AdminOnboardingReset />
        </AdminLayout>
      } />
      
      <Route path="invites" element={
        <AdminLayout>
          <InvitesManagement />
        </AdminLayout>
      } />
      
      <Route path="community" element={
        <AdminLayout>
          <CommunityModerationPage />
        </AdminLayout>
      } />
      
      <Route path="diagnostics" element={
        <AdminLayout>
          <SupabaseDiagnostics />
        </AdminLayout>
      } />
    </Routes>
  );
};
