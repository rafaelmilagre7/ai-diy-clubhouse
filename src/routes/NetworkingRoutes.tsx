
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SmartFeatureGuard } from '@/components/auth/SmartFeatureGuard';
import NetworkingPage from '@/pages/member/networking/NetworkingPage';
import { ConnectionsManager } from '@/components/networking/ConnectionsManager';

export const NetworkingRoutes = () => {
  return (
    <SmartFeatureGuard feature="networking">
      <Routes>
        <Route index element={<NetworkingPage />} />
        <Route path="connections" element={<ConnectionsManager />} />
      </Routes>
    </SmartFeatureGuard>
  );
};

export default NetworkingRoutes;
