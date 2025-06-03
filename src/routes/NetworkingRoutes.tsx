
import React from 'react';
import { Routes, Route } from 'react-router-dom';

const NetworkingRoutes = () => {
  return (
    <Routes>
      <Route index element={<div>Networking Home</div>} />
      <Route path="*" element={<div>Networking Page</div>} />
    </Routes>
  );
};

export default NetworkingRoutes;
