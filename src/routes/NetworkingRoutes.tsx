
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SmartFeatureGuard } from '@/components/auth/SmartFeatureGuard';

// Lazy load networking pages
const NetworkingPage = React.lazy(() => import('@/pages/member/networking/NetworkingPage'));
const ConnectionsManager = React.lazy(() => import('@/components/networking/ConnectionsManager'));

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
