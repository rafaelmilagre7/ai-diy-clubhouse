
import React from 'react';
import { Routes, Route } from 'react-router-dom';

const BenefitsRoutes = () => {
  return (
    <Routes>
      <Route index element={<div>Benefits Home</div>} />
      <Route path="*" element={<div>Benefits Page</div>} />
    </Routes>
  );
};

export default BenefitsRoutes;
