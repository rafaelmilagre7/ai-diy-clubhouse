
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

// Solutions - Import direto para melhor performance
import Solutions from '@/pages/member/Solutions';
import SolutionDetails from '@/pages/member/SolutionDetails';

// Tools - Import direto para melhor performance
import Tools from '@/pages/member/Tools';
import ToolDetails from '@/pages/member/ToolDetails';

// Benefits - Import direto para melhor performance
import Benefits from '@/pages/member/Benefits';

// Learning - Import direto para melhor performance - CORRIGIDO
import LearningPage from '@/pages/member/learning/LearningPage';
import CourseDetails from '@/pages/member/learning/CourseDetails';
import LessonView from '@/pages/member/learning/LessonView';

// Lazy load apenas rotas pesadas
const CommunityRoutes = React.lazy(() => import('./CommunityRoutes'));
const NetworkingRoutes = React.lazy(() => import('./NetworkingRoutes'));

export const MemberRoutes = () => {
  return (
    <MemberLayout>
      <Routes>
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Implementation Trail */}
        <Route path="/implementation-trail" element={<ImplementationTrailPage />} />
        
        {/* Solutions Routes - Direto sem lazy loading */}
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/solutions/:id" element={<SolutionDetails />} />
        
        {/* Tools Routes - Direto sem lazy loading */}
        <Route path="/tools" element={<Tools />} />
        <Route path="/tools/:id" element={<ToolDetails />} />
        
        {/* Benefits Routes - Direto sem lazy loading */}
        <Route path="/benefits" element={<Benefits />} />
        
        {/* Learning Routes - Direto sem lazy loading - GARANTINDO USO CORRETO */}
        <Route path="/learning" element={<LearningPage />} />
        <Route path="/learning/course/:id" element={<CourseDetails />} />
        <Route path="/learning/course/:courseId/lesson/:lessonId" element={<LessonView />} />
        
        {/* Community Routes - Mantém lazy loading (pesado) */}
        <Route path="/comunidade/*" element={
          <React.Suspense fallback={<div className="p-6">Carregando comunidade...</div>}>
            <CommunityRoutes />
          </React.Suspense>
        } />
        
        {/* Networking Routes - Mantém lazy loading */}
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
