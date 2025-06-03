
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LearningPage from '@/pages/member/learning/LearningPage';

export const LearningRoutes = () => {
  return (
    <Routes>
      <Route index element={<LearningPage />} />
    </Routes>
  );
};

export default LearningRoutes;
