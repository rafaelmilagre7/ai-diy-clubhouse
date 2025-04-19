
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

// Layouts
import AdminLayout from '@/components/layout/AdminLayout';
import MemberLayout from '@/components/layout/MemberLayout';
import RootRedirect from './RootRedirect';

// Auth Pages
import Auth from '@/pages/Auth';
import Login from '@/pages/Login';

// Error Pages
import NotFound from '@/pages/NotFound';

// Lazy-loaded Admin Pages
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminSolutions = lazy(() => import('@/pages/admin/AdminSolutions'));
const AdminSolutionEdit = lazy(() => import('@/pages/admin/AdminSolutionEdit'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));
const AdminTools = lazy(() => import('@/pages/admin/AdminTools'));
const AdminToolEdit = lazy(() => import('@/pages/admin/AdminToolEdit'));
const BenefitStats = lazy(() => import('@/pages/admin/BenefitStats'));

// Lazy-loaded Member Pages
const Dashboard = lazy(() => import('@/pages/member/Dashboard'));
const Solutions = lazy(() => import('@/pages/member/Solutions'));
const SolutionDetails = lazy(() => import('@/pages/member/SolutionDetails'));
const SolutionImplementation = lazy(() => import('@/pages/member/SolutionImplementation'));
const ImplementationCompleted = lazy(() => import('@/pages/member/ImplementationCompleted'));
const ImplementationConfirmation = lazy(() => import('@/pages/member/ImplementationConfirmation'));
const Profile = lazy(() => import('@/pages/member/Profile'));
const EditProfile = lazy(() => import('@/pages/member/EditProfile'));
const Achievements = lazy(() => import('@/pages/member/Achievements'));
const Tools = lazy(() => import('@/pages/member/Tools'));
const ToolDetails = lazy(() => import('@/pages/member/ToolDetails'));

// Loading Fallback
import LoadingScreen from '@/components/common/LoadingScreen';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  const { isAdmin } = useAuth();

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Redirect root to appropriate dashboard */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* Auth routes */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Login />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="solutions" element={<AdminSolutions />} />
          <Route path="solutions/:id" element={<AdminSolutionEdit />} />
          <Route path="tools" element={<AdminTools />} />
          <Route path="tools/:id" element={<AdminToolEdit />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="benefits" element={<BenefitStats />} />
        </Route>
        
        {/* Member routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <MemberLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="solutions" element={<Solutions />} />
          <Route path="solution/:id" element={<SolutionDetails />} />
          <Route path="implementation/:id" element={<SolutionImplementation />} />
          <Route path="implementation/:id/completed" element={<ImplementationCompleted />} />
          <Route path="implementation/:id/confirm" element={<ImplementationConfirmation />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/edit" element={<EditProfile />} />
          <Route path="achievements" element={<Achievements />} />
          <Route path="tools" element={<Tools />} />
          <Route path="tools/:id" element={<ToolDetails />} />
        </Route>
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
