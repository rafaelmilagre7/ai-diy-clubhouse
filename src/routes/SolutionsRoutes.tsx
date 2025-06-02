
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load solutions pages
const Solutions = React.lazy(() => import('@/pages/member/Solutions'));
const SolutionDetails = React.lazy(() => import('@/pages/member/SolutionDetails'));

export const SolutionsRoutes = () => {
  return (
    <Routes>
      <Route index element={<Solutions />} />
      <Route path=":id" element={<SolutionDetails />} />
    </Routes>
  );
};

export default SolutionsRoutes;
