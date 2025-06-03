
import React from 'react';
import { Routes, Route } from 'react-router-dom';

const ToolsRoutes = () => {
  return (
    <Routes>
      <Route index element={<div>Tools Home</div>} />
      <Route path="*" element={<div>Tools Page</div>} />
    </Routes>
  );
};

export default ToolsRoutes;
