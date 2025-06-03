
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NetworkingPage from '@/pages/member/NetworkingPage';

export const NetworkingRoutes = () => {
  return (
    <Routes>
      <Route index element={<NetworkingPage />} />
    </Routes>
  );
};

export default NetworkingRoutes;
