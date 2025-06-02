
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MemberLayout from '@/components/layout/MemberLayout';
import NetworkingPage from '@/pages/member/networking/NetworkingPage';

export const NetworkingRoutes = () => {
  return (
    <Routes>
      <Route index element={
        <MemberLayout>
          <NetworkingPage />
        </MemberLayout>
      } />
    </Routes>
  );
};
