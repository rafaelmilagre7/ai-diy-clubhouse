
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MemberLayout from '@/components/layout/MemberLayout';

// Dashboard
import Dashboard from '@/pages/member/Dashboard';

// Events
import Events from '@/pages/member/Events';

// Profile
import Profile from '@/pages/member/Profile';
import EditProfile from '@/pages/member/EditProfile';

// Implementation Trail
import ImplementationTrailPage from '@/pages/member/ImplementationTrailPage';

// Suggestions - Sistema Completo
import Suggestions from '@/pages/member/Suggestions';
import NewSuggestion from '@/pages/member/NewSuggestion';
import SuggestionDetails from '@/pages/member/SuggestionDetails';

// Lazy load route modules
const SolutionsRoutes = React.lazy(() => import('./SolutionsRoutes'));
const ToolsRoutes = React.lazy(() => import('./ToolsRoutes'));
const BenefitsRoutes = React.lazy(() => import('./BenefitsRoutes'));
const CommunityRoutes = React.lazy(() => import('./CommunityRoutes'));
const LearningRoutes = React.lazy(() => import('./LearningRoutes'));
const NetworkingRoutes = React.lazy(() => import('./NetworkingRoutes'));

export const MemberRoutes = () => {
  return (
    <MemberLayout>
      <Routes>
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Implementation Trail */}
        <Route path="/implementation-trail" element={<ImplementationTrailPage />} />
        
        {/* Solutions Routes */}
        <Route path="/solutions/*" element={
          <React.Suspense fallback={<div className="p-6">Carregando soluções...</div>}>
            <SolutionsRoutes />
          </React.Suspense>
        } />
        
        {/* Tools Routes */}
        <Route path="/tools/*" element={
          <React.Suspense fallback={<div className="p-6">Carregando ferramentas...</div>}>
            <ToolsRoutes />
          </React.Suspense>
        } />
        
        {/* Benefits Routes */}
        <Route path="/benefits/*" element={
          <React.Suspense fallback={<div className="p-6">Carregando benefícios...</div>}>
            <BenefitsRoutes />
          </React.Suspense>
        } />
        
        {/* Community Routes */}
        <Route path="/comunidade/*" element={
          <React.Suspense fallback={<div className="p-6">Carregando comunidade...</div>}>
            <CommunityRoutes />
          </React.Suspense>
        } />
        
        {/* Learning Routes */}
        <Route path="/learning/*" element={
          <React.Suspense fallback={<div className="p-6">Carregando aprendizado...</div>}>
            <LearningRoutes />
          </React.Suspense>
        } />
        
        {/* Networking Routes */}
        <Route path="/networking/*" element={
          <React.Suspense fallback={<div className="p-6">Carregando networking...</div>}>
            <NetworkingRoutes />
          </React.Suspense>
        } />

        {/* Suggestions - Sistema Completo */}
        <Route path="/suggestions" element={<Suggestions />} />
        <Route path="/suggestions/new" element={<NewSuggestion />} />
        <Route path="/suggestions/:id" element={<SuggestionDetails />} />

        {/* Events */}
        <Route path="/events" element={<Events />} />

        {/* Profile */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MemberLayout>
  );
};
