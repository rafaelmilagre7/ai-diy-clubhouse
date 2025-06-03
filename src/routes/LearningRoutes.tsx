
import React from 'react';
import { Routes, Route } from 'react-router-dom';

const LearningRoutes = () => {
  return (
    <Routes>
      <Route index element={<div>Learning Home</div>} />
      <Route path="*" element={<div>Learning Page</div>} />
    </Routes>
  );
};

export default LearningRoutes;
