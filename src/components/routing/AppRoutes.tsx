
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AdminProtectedRoutes } from '@/auth/AdminProtectedRoutes';
import { ProtectedRoutes } from '@/auth/ProtectedRoutes';

// Layout Components
import MemberLayout from '@/components/layout/MemberLayout';
import AdminLayout from '@/components/layout/admin/AdminLayout';

// Todas as páginas carregadas estaticamente
import Dashboard from '@/pages/member/Dashboard';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminTools from '@/pages/admin/AdminTools';
import Tools from '@/pages/member/Tools';
import Profile from '@/pages/member/Profile';
import Solutions from '@/pages/member/Solutions';
import SolutionDetails from '@/pages/member/SolutionDetails';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ResetPassword from '@/pages/auth/ResetPassword';
import SetNewPassword from '@/pages/auth/SetNewPassword';
import NotFound from '@/pages/NotFound';
import EditProfile from '@/pages/member/EditProfile';
import SolutionImplementation from '@/pages/member/SolutionImplementation';
import ImplementationCompleted from '@/pages/member/ImplementationCompleted';
import ImplementationTrailPage from '@/pages/member/ImplementationTrailPage';
import SuggestionsPage from '@/pages/member/Suggestions';
import AdminSuggestions from '@/pages/admin/AdminSuggestions';
import AdminSuggestionDetails from '@/pages/admin/AdminSuggestionDetails';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/set-new-password" element={<SetNewPassword />} />
      
      {/* Rotas protegidas para membros */}
      <Route path="/" element={
        <ProtectedRoutes>
          <MemberLayout />
        </ProtectedRoutes>
      }>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="edit-profile" element={<EditProfile />} />
        <Route path="tools" element={<Tools />} />
        <Route path="solutions" element={<Solutions />} />
        <Route path="solution/:id" element={<SolutionDetails />} />
        <Route path="suggestions" element={<SuggestionsPage />} />
        <Route path="implementation-trail" element={<ImplementationTrailPage />} />
        <Route path="solution/:id/implementation/:moduleId" element={<SolutionImplementation />} />
        <Route path="solution/:id/completed" element={<ImplementationCompleted />} />
      </Route>
      
      {/* Rotas protegidas para admins */}
      <Route path="/admin" element={
        <AdminProtectedRoutes>
          <AdminLayout />
        </AdminProtectedRoutes>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="tools" element={<AdminTools />} />
        <Route path="suggestions" element={<AdminSuggestions />} />
        <Route path="suggestions/:id" element={<AdminSuggestionDetails />} />
      </Route>
      
      {/* Rota 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;

