
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Layout from '@/components/layout/Layout';
import AdminLayout from '@/components/layout/AdminLayout';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/member/Dashboard';
import Profile from '@/pages/member/Profile';
import EditProfile from '@/pages/member/EditProfile';
import SolutionImplementation from '@/pages/member/SolutionImplementation';
import SolutionDetails from '@/pages/member/SolutionDetails';
import ImplementationCompleted from '@/pages/member/ImplementationCompleted';
import ImplementationConfirmation from '@/pages/member/ImplementationConfirmation';
import Solutions from '@/pages/member/Solutions';
import Achievements from '@/pages/member/Achievements';
import Tools from '@/pages/member/Tools';
import ToolDetails from '@/pages/member/ToolDetails';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminSolutions from '@/pages/admin/AdminSolutions';
import AdminSolutionEdit from '@/pages/admin/AdminSolutionEdit';
import AdminSolutionCreate from '@/pages/admin/AdminSolutionCreate';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminSettings from '@/pages/admin/AdminSettings';
import SolutionMetrics from '@/pages/admin/SolutionMetrics';
import AdminTools from '@/pages/admin/AdminTools';
import AdminToolEdit from '@/pages/admin/AdminToolEdit';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/index" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      
      {/* Rotas de Membro */}
      <Route element={<Layout />}>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/solution/:id" element={<ProtectedRoute><SolutionDetails /></ProtectedRoute>} />
        <Route path="/solutions" element={<ProtectedRoute><Solutions /></ProtectedRoute>} />
        <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
        <Route path="/tools" element={<ProtectedRoute><Tools /></ProtectedRoute>} />
        <Route path="/tools/:id" element={<ProtectedRoute><ToolDetails /></ProtectedRoute>} />
        
        {/* Rotas de Implementação */}
        <Route path="/implement/:id/:moduleIndex" element={<ProtectedRoute><SolutionImplementation /></ProtectedRoute>} />
        <Route path="/implementation/:id/completed" element={<ProtectedRoute><ImplementationCompleted /></ProtectedRoute>} />
        <Route path="/implementation/:id/confirmation" element={<ProtectedRoute><ImplementationConfirmation /></ProtectedRoute>} />
        <Route path="/solution/:id/implement" element={<ProtectedRoute><SolutionImplementation /></ProtectedRoute>} />
      </Route>
      
      {/* Rotas de Administração */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/solutions" element={<ProtectedRoute requireAdmin={true}><AdminSolutions /></ProtectedRoute>} />
        <Route path="/admin/solutions/:id" element={<ProtectedRoute requireAdmin={true}><AdminSolutionEdit /></ProtectedRoute>} />
        <Route path="/admin/solutions/new" element={<ProtectedRoute requireAdmin={true}><AdminSolutionCreate /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requireAdmin={true}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute requireAdmin={true}><AdminAnalytics /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute requireAdmin={true}><AdminSettings /></ProtectedRoute>} />
        <Route path="/admin/metrics/:id" element={<ProtectedRoute requireAdmin={true}><SolutionMetrics /></ProtectedRoute>} />
        <Route path="/admin/tools" element={<ProtectedRoute requireAdmin={true}><AdminTools /></ProtectedRoute>} />
        <Route path="/admin/tools/new" element={<ProtectedRoute requireAdmin={true}><AdminToolEdit /></ProtectedRoute>} />
        <Route path="/admin/tools/:id" element={<ProtectedRoute requireAdmin={true}><AdminToolEdit /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
