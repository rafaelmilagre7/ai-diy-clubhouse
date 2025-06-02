
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MemberLayout from '@/components/layout/MemberLayout';
import Solutions from '@/pages/member/Solutions';
import SolutionDetails from '@/pages/member/SolutionDetails';

export const SolutionsRoutes = () => {
  return (
    <Routes>
      <Route index element={
        <MemberLayout>
          <Solutions />
        </MemberLayout>
      } />
      
      <Route path=":id" element={
        <MemberLayout>
          <SolutionDetails />
        </MemberLayout>
      } />
    </Routes>
  );
};
