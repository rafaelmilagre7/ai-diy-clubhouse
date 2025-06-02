
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CommunityHome from '@/pages/member/community/CommunityHome';

export const CommunityRoutes = () => {
  return (
    <Routes>
      <Route index element={<CommunityHome />} />
    </Routes>
  );
};
