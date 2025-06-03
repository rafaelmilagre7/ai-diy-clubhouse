
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingProtectedRoute } from '@/components/onboarding/OnboardingProtectedRoute';
import { lazy, Suspense } from 'react';
import LoadingScreen from '@/components/common/LoadingScreen';

// Lazy loading das páginas principais - caminhos corretos
const Dashboard = lazy(() => import('@/pages/member/Dashboard'));
const ImplementationTrailPage = lazy(() => import('@/pages/implementation-trail/ImplementationTrailPage'));
const ProfileRoutes = lazy(() => import('@/routes/ProfileRoutes'));
const SolutionsPage = lazy(() => import('@/pages/member/Solutions'));
const SolutionDetails = lazy(() => import('@/pages/member/SolutionDetails'));
const CommunityRoutes = lazy(() => import('@/routes/CommunityRoutes'));
const NetworkingRoutes = lazy(() => import('@/routes/NetworkingRoutes'));
const ToolsPage = lazy(() => import('@/pages/member/Tools'));
const LearningRoutes = lazy(() => import('@/routes/LearningRoutes'));

export const MemberRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Rota principal - Dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Trilha de implementação - requer onboarding */}
        <Route 
          path="implementation-trail" 
          element={
            <OnboardingProtectedRoute>
              <ImplementationTrailPage />
            </OnboardingProtectedRoute>
          } 
        />
        
        {/* Networking - requer onboarding */}
        <Route 
          path="networking/*" 
          element={
            <OnboardingProtectedRoute>
              <NetworkingRoutes />
            </OnboardingProtectedRoute>
          } 
        />
        
        {/* Demais rotas - não requerem onboarding */}
        <Route path="profile/*" element={<ProfileRoutes />} />
        <Route path="solutions" element={<SolutionsPage />} />
        <Route path="solutions/:id" element={<SolutionDetails />} />
        <Route path="comunidade/*" element={<CommunityRoutes />} />
        <Route path="learning/*" element={<LearningRoutes />} />
        <Route path="tools" element={<ToolsPage />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};
