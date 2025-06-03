
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingProtectedRoute } from '@/components/onboarding/OnboardingProtectedRoute';
import { lazy, Suspense } from 'react';
import LoadingScreen from '@/components/common/LoadingScreen';

// Lazy loading das páginas principais
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const ImplementationTrailPage = lazy(() => import('@/pages/implementation-trail/ImplementationTrailPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SolutionsPage = lazy(() => import('@/pages/SolutionsPage'));
const SolutionDetails = lazy(() => import('@/pages/SolutionDetails'));
const CommunityPage = lazy(() => import('@/pages/community/CommunityPage'));
const NetworkingPage = lazy(() => import('@/pages/NetworkingPage'));
const ToolsPage = lazy(() => import('@/pages/ToolsPage'));
const LearningPage = lazy(() => import('@/pages/LearningPage'));

export const MemberRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Rota principal - Dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Trilha de implementação - requer onboarding */}
        <Route 
          path="/implementation-trail" 
          element={
            <OnboardingProtectedRoute>
              <ImplementationTrailPage />
            </OnboardingProtectedRoute>
          } 
        />
        
        {/* Networking - requer onboarding */}
        <Route 
          path="/networking" 
          element={
            <OnboardingProtectedRoute>
              <NetworkingPage />
            </OnboardingProtectedRoute>
          } 
        />
        
        {/* Demais rotas - não requerem onboarding */}
        <Route path="/profile/*" element={<ProfilePage />} />
        <Route path="/solutions" element={<SolutionsPage />} />
        <Route path="/solutions/:id" element={<SolutionDetails />} />
        <Route path="/comunidade/*" element={<CommunityPage />} />
        <Route path="/learning/*" element={<LearningPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};
