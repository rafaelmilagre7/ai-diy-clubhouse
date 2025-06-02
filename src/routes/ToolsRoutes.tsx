
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MemberLayout from '@/components/layout/MemberLayout';
import Tools from '@/pages/member/Tools';

export const ToolsRoutes = () => {
  return (
    <Routes>
      <Route index element={
        <MemberLayout>
          <Tools />
        </MemberLayout>
      } />
    </Routes>
  );
};
