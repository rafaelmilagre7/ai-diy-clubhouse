
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleGuard } from '../guards/RoleGuard';
import { lazy, Suspense } from 'react';
import LoadingScreen from '@/components/common/LoadingScreen';

// Lazy loading das páginas de membros
const Dashboard = lazy(() => import('@/pages/member/OptimizedDashboard'));
const Solutions = lazy(() => import('@/pages/member/Solutions'));
const ImplementationTrail = lazy(() => import('@/pages/member/ImplementationTrailPage'));
const Tools = lazy(() => import('@/pages/member/Tools'));
const Learning = lazy(() => import('@/pages/member/learning/LearningPage'));
const Community = lazy(() => import('@/pages/member/community/CommunityPage'));
const Networking = lazy(() => import('@/pages/member/networking/NetworkingPage'));
const Profile = lazy(() => import('@/pages/member/Profile'));

export const MemberRoutes: React.FC = () => {
  return (
    <RoleGuard allowedRoles={['member', 'admin', 'formacao']}>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/solucoes" element={<Solutions />} />
          <Route path="/trilha-implementacao" element={<ImplementationTrail />} />
          <Route path="/ferramentas" element={<Tools />} />
          <Route path="/aprendizado" element={<Learning />} />
          <Route path="/aprendizado/*" element={<Learning />} />
          <Route path="/comunidade" element={<Community />} />
          <Route path="/comunidade/*" element={<Community />} />
          <Route path="/networking" element={<Networking />} />
          <Route path="/perfil" element={<Profile />} />
          
          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/home" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </RoleGuard>
  );
};
