
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Layout from '@/components/layout/Layout';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/member/Dashboard';
import Profile from '@/pages/member/Profile';
import EditProfile from '@/pages/member/EditProfile';
import SolutionImplementation from '@/pages/member/SolutionImplementation';
import SolutionDetails from '@/pages/member/SolutionDetails';
import ImplementationCompleted from '@/pages/member/ImplementationCompleted';
import ImplementationConfirmation from '@/pages/member/ImplementationConfirmation';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/index" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route element={<Layout />}>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/solution/:id" element={<SolutionDetails />} />
          <Route path="/solution/:id/implement" element={<SolutionImplementation />} />
          <Route path="/implementation/:id/completed" element={<ImplementationCompleted />} />
          <Route path="/implementation/:id/confirmation" element={<ImplementationConfirmation />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
