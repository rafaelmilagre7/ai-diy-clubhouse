
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Benefits from '@/pages/member/Benefits';

export const BenefitsRoutes = () => {
  return (
    <Routes>
      <Route index element={<Benefits />} />
    </Routes>
  );
};

export default BenefitsRoutes;
