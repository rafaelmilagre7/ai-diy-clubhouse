
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MemberLayout from '@/components/layout/MemberLayout';
import Benefits from '@/pages/member/Benefits';

export const BenefitsRoutes = () => {
  return (
    <Routes>
      <Route index element={
        <MemberLayout>
          <Benefits />
        </MemberLayout>
      } />
    </Routes>
  );
};
