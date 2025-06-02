
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

// Solutions
import Solutions from '@/pages/member/Solutions';
import SolutionDetails from '@/pages/member/SolutionDetails';

// Learning
import LearningPage from '@/pages/member/learning/LearningPage';

// Networking
import NetworkingPage from '@/pages/member/networking/NetworkingPage';

// Benefits
import Benefits from '@/pages/member/Benefits';

// Tools
import Tools from '@/pages/member/Tools';

// Events
import Events from '@/pages/member/Events';

// Profile
import Profile from '@/pages/member/Profile';
import EditProfile from '@/pages/member/EditProfile';

// Community
import CommunityHome from '@/pages/member/community/CommunityHome';

export const MemberRoutes = () => {
  return (
    <MemberLayout>
      <Routes>
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Implementation Trail */}
        <Route path="/implementation-trail" element={<ImplementationTrailPage />} />
        
        {/* Learning/Courses */}
        <Route path="/learning" element={<LearningPage />} />
        
        {/* Networking */}
        <Route path="/networking" element={<NetworkingPage />} />
        
        {/* Benefits */}
        <Route path="/benefits" element={<Benefits />} />
        
        {/* Community */}
        <Route path="/comunidade" element={<CommunityHome />} />
        
        {/* Suggestions - Sistema Completo */}
        <Route path="/suggestions" element={<Suggestions />} />
        <Route path="/suggestions/new" element={<NewSuggestion />} />
        <Route path="/suggestions/:id" element={<SuggestionDetails />} />

        {/* Solutions */}
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/solutions/:id" element={<SolutionDetails />} />

        {/* Tools */}
        <Route path="/tools" element={<Tools />} />

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
