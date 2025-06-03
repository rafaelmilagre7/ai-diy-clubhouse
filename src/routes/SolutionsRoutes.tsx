
import React from 'react';
import { Routes, Route } from 'react-router-dom';

const SolutionsRoutes = () => {
  return (
    <Routes>
      <Route index element={<div>Solutions Home</div>} />
      <Route path="*" element={<div>Solutions Page</div>} />
    </Routes>
  );
};

export default SolutionsRoutes;
