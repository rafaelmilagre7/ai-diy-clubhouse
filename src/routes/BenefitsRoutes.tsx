
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load benefits page
const Benefits = React.lazy(() => import('@/pages/member/Benefits'));

export const BenefitsRoutes = () => {
  return (
    <Routes>
      <Route index element={<Benefits />} />
    </Routes>
  );
};

export default BenefitsRoutes;
