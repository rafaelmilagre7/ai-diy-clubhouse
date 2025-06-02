
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MemberLayout from '@/components/layout/MemberLayout';

// Dashboard
import Dashboard from '@/pages/member/Dashboard';

// Implementation Trail
import ImplementationTrailPage from '@/pages/member/ImplementationTrailPage';

// Suggestions - Sistema Completo
import Suggestions from '@/pages/member/Suggestions';
import NewSuggestion from '@/pages/member/NewSuggestion';
import SuggestionDetails from '@/pages/member/SuggestionDetails';

// Learning
import LearningPage from '@/pages/member/learning/LearningPage';
import CourseDetails from '@/pages/member/learning/CourseDetails';
import LessonView from '@/pages/member/learning/LessonView';

// Networking
import NetworkingPage from '@/pages/member/networking/NetworkingPage';

// Community
import CommunityHome from '@/pages/member/community/CommunityHome';

// Solutions
import Solutions from '@/pages/member/Solutions';
import SolutionDetails from '@/pages/member/SolutionDetails';

// Tools, Benefits, Events
import Tools from '@/pages/member/Tools';
import Benefits from '@/pages/member/Benefits';
import Events from '@/pages/member/Events';

// Profile
import Profile from '@/pages/member/Profile';
import EditProfile from '@/pages/member/EditProfile';

export const MemberRoutes = () => {
  return (
    <MemberLayout>
      <Routes>
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Implementation Trail */}
        <Route path="/implementation-trail" element={<ImplementationTrailPage />} />
        
        {/* Learning/Courses - Rotas aninhadas */}
        <Route path="/learning" element={<LearningPage />} />
        <Route path="/learning/course/:id" element={<CourseDetails />} />
        <Route path="/learning/course/:courseId/lesson/:lessonId" element={<LessonView />} />
        
        {/* Networking */}
        <Route path="/networking" element={<NetworkingPage />} />
        
        {/* Community */}
        <Route path="/comunidade" element={<CommunityHome />} />
        
        {/* Solutions */}
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/solutions/:id" element={<SolutionDetails />} />
        
        {/* Tools */}
        <Route path="/tools" element={<Tools />} />
        
        {/* Benefits */}
        <Route path="/benefits" element={<Benefits />} />
        
        {/* Events */}
        <Route path="/events" element={<Events />} />
        
        {/* Suggestions - Sistema Completo */}
        <Route path="/suggestions" element={<Suggestions />} />
        <Route path="/suggestions/new" element={<NewSuggestion />} />
        <Route path="/suggestions/:id" element={<SuggestionDetails />} />

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
