
import { RouteObject } from "react-router-dom";
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import { lazy } from 'react';

// Admin pages - usando versões otimizadas
const OptimizedAdminDashboard = lazy(() => import('@/pages/admin/OptimizedAdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminTools = lazy(() => import('@/pages/admin/AdminTools'));
const AdminSolutions = lazy(() => import('@/pages/admin/AdminSolutions'));
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'));
const AdminOnboarding = lazy(() => import('@/pages/admin/AdminOnboarding'));
const AdminSuggestions = lazy(() => import('@/pages/admin/AdminSuggestions'));
const AdminEvents = lazy(() => import('@/pages/admin/AdminEvents'));
const AdminRoles = lazy(() => import('@/pages/admin/AdminRoles'));
const AdminAccessLogs = lazy(() => import('@/pages/admin/AdminAccessLogs'));
const InvitesManagement = lazy(() => import('@/pages/admin/invites/InvitesManagement'));
const CommunityModerationPage = lazy(() => import('@/pages/admin/community/CommunityModerationPage'));
const PerformanceDashboard = lazy(() => import('@/components/admin/performance/PerformanceDashboard'));
const AdminNetworkingPage = lazy(() => import('@/pages/admin/networking/AdminNetworkingPage'));
const AccessAnalyticsDashboard = lazy(() => import('@/components/admin/analytics/AccessAnalyticsDashboard'));

// Função helper para criar rotas protegidas com AdminLayout
const createAdminRoute = (path: string, Component: React.ComponentType<any>) => ({
  path,
  element: <ProtectedRoutes><AdminLayout><Component /></AdminLayout></ProtectedRoutes>
});

export const adminRoutes: RouteObject[] = [
  createAdminRoute("/admin", OptimizedAdminDashboard),
  createAdminRoute("/admin/users", AdminUsers),
  createAdminRoute("/admin/tools", AdminTools),
  createAdminRoute("/admin/solutions", AdminSolutions),
  createAdminRoute("/admin/analytics", AdminAnalytics),
  createAdminRoute("/admin/performance", PerformanceDashboard),
  createAdminRoute("/admin/onboarding", AdminOnboarding),
  createAdminRoute("/admin/suggestions", AdminSuggestions),
  createAdminRoute("/admin/events", AdminEvents),
  createAdminRoute("/admin/roles", AdminRoles),
  createAdminRoute("/admin/access-logs", AdminAccessLogs),
  createAdminRoute("/admin/access-analytics", AccessAnalyticsDashboard),
  createAdminRoute("/admin/invites", InvitesManagement),
  createAdminRoute("/admin/community", CommunityModerationPage),
  createAdminRoute("/admin/networking", AdminNetworkingPage),
];
