
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load tools pages
const Tools = React.lazy(() => import('@/pages/member/Tools'));
const ToolDetails = React.lazy(() => import('@/pages/member/ToolDetails'));

export const ToolsRoutes = () => {
  return (
    <Routes>
      <Route index element={<Tools />} />
      <Route path=":id" element={<ToolDetails />} />
    </Routes>
  );
};

export default ToolsRoutes;
