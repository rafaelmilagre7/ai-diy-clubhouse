
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Tools from '@/pages/member/Tools';

export const ToolsRoutes = () => {
  return (
    <Routes>
      <Route index element={<Tools />} />
    </Routes>
  );
};
