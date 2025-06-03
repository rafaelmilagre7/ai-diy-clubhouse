
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Solutions from '@/pages/member/Solutions';
import SolutionDetails from '@/pages/member/SolutionDetails';

export const SolutionsRoutes = () => {
  return (
    <Routes>
      <Route index element={<Solutions />} />
      <Route path=":id" element={<SolutionDetails />} />
    </Routes>
  );
};

export default SolutionsRoutes;
