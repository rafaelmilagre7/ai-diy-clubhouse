import { Route } from 'react-router-dom';
import { lazy } from 'react';
import MasterLayout from '@/components/layout/master/MasterLayout';
import AuthProtectedRoutes from '@/components/auth/AuthProtectedRoutes';

const MasterDashboard = lazy(() => import('@/pages/master/MasterDashboard'));
const TeamManagement = lazy(() => import('@/pages/master/TeamManagement'));
const MasterSync = lazy(() => import('@/pages/master/MasterSync'));

export const masterRoutes = (
  <Route 
    path="/master-dashboard" 
    element={
      <AuthProtectedRoutes>
        <MasterLayout />
      </AuthProtectedRoutes>
    }
  >
    <Route index element={<MasterDashboard />} />
    <Route path="team" element={<TeamManagement />} />
    <Route path="sync" element={<MasterSync />} />
    <Route path="invites" element={<div className="p-6">Convites Master - Em desenvolvimento</div>} />
    <Route path="analytics" element={<div className="p-6">Analytics Master - Em desenvolvimento</div>} />
    <Route path="settings" element={<div className="p-6">Configurações Master - Em desenvolvimento</div>} />
  </Route>
);