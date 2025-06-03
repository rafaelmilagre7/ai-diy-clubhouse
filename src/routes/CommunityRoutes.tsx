
import React from 'react';
import { Routes, Route } from 'react-router-dom';

const CommunityRoutes = () => {
  return (
    <Routes>
      <Route index element={<div>Community Home</div>} />
      <Route path="*" element={<div>Community Page</div>} />
    </Routes>
  );
};

export default CommunityRoutes;
