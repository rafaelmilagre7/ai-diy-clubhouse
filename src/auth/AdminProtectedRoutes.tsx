
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { SmartFeatureGuard } from '@/components/auth/SmartFeatureGuard';

// Admin Dashboard
import AdminDashboard from '@/pages/admin/AdminDashboard';

// Soluções
import AdminSolutions from '@/pages/admin/AdminSolutions';
import SolutionEditor from '@/pages/admin/SolutionEditor';

// LMS (Área de Formação)
import AdminCourses from '@/pages/admin/AdminCourses';
import AdminLessons from '@/pages/admin/AdminLessons';
import LessonEditor from '@/pages/admin/LessonEditor';

// Outros módulos administrativos
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminInvites from '@/pages/admin/AdminInvites';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminRoles from '@/pages/admin/AdminRoles';
import AdminSuggestions from '@/pages/admin/AdminSuggestions';
import AdminOnboarding from '@/pages/admin/AdminOnboarding';
import AdminConfig from '@/pages/admin/AdminConfig';

const AdminProtectedRoutes = () => {
  return (
    <Routes>
      {/* Dashboard */}
      <Route index element={<AdminDashboard />} />
      
      {/* Soluções */}
      <Route path="solutions" element={<AdminSolutions />} />
      <Route path="solutions/:id" element={<SolutionEditor />} />
      <Route path="solutions/new" element={<SolutionEditor />} />
      
      {/* LMS - Área de Formação (protegida por permissão) */}
      <Route 
        path="courses" 
        element={
          <SmartFeatureGuard feature="lms_management">
            <AdminCourses />
          </SmartFeatureGuard>
        } 
      />
      <Route 
        path="courses/:courseId/lessons" 
        element={
          <SmartFeatureGuard feature="lms_management">
            <AdminLessons />
          </SmartFeatureGuard>
        } 
      />
      <Route 
        path="courses/:courseId/lessons/:lessonId" 
        element={
          <SmartFeatureGuard feature="lms_management">
            <LessonEditor />
          </SmartFeatureGuard>
        } 
      />
      <Route 
        path="courses/:courseId/lessons/new" 
        element={
          <SmartFeatureGuard feature="lms_management">
            <LessonEditor />
          </SmartFeatureGuard>
        } 
      />
      
      {/* Usuários */}
      <Route path="users" element={<AdminUsers />} />
      
      {/* Convites */}
      <Route path="invites" element={<AdminInvites />} />
      
      {/* Eventos */}
      <Route path="events" element={<AdminEvents />} />
      
      {/* Papéis */}
      <Route path="roles" element={<AdminRoles />} />
      
      {/* Sugestões */}
      <Route path="suggestions" element={<AdminSuggestions />} />
      
      {/* Onboarding */}
      <Route path="onboarding" element={<AdminOnboarding />} />
      
      {/* Configurações */}
      <Route path="config" element={<AdminConfig />} />
      
      {/* Rota padrão */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminProtectedRoutes;
