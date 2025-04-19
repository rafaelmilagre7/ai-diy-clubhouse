
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from '@/pages/Auth';
import Layout from '@/components/layout/Layout';
import AdminLayout from '@/components/layout/AdminLayout';

// Admin pages
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminSolutions from '@/pages/admin/AdminSolutions';
import AdminTools from '@/pages/admin/AdminTools';
import AdminToolEdit from '@/pages/admin/AdminToolEdit';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminBenefits from '@/pages/admin/BenefitStats';
import AdminSettings from '@/pages/admin/AdminSettings';

// Member pages
import Dashboard from '@/pages/member/Dashboard';
import Solutions from '@/pages/member/Solutions';
import SolutionDetails from '@/pages/member/SolutionDetails';
import Tools from '@/pages/member/Tools';
import ToolDetails from '@/pages/member/ToolDetails';
import Benefits from '@/pages/member/Benefits';
import SuggestionsPage from '@/pages/member/Suggestions';
import NewSuggestionPage from '@/pages/member/NewSuggestion';
import SuggestionDetailsPage from '@/pages/member/SuggestionDetails';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/auth" element={<Auth />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="solutions/*" element={<AdminSolutions />} />
        <Route path="tools" element={<AdminTools />} />
        <Route path="tools/:id" element={<AdminToolEdit />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="benefits" element={<AdminBenefits />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="suggestions" element={<SuggestionsPage />} />
      </Route>

      {/* Member Routes */}
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/solutions/:id" element={<SolutionDetails />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/tools/:id" element={<ToolDetails />} />
        <Route path="/benefits" element={<Benefits />} />
        <Route path="/suggestions" element={<SuggestionsPage />} />
        <Route path="/suggestions/new" element={<NewSuggestionPage />} />
        <Route path="/suggestions/:id" element={<SuggestionDetailsPage />} />
      </Route>

      {/* Catch-all route for 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
