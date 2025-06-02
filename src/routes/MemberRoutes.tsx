
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

export const MemberRoutes = () => {
  return (
    <MemberLayout>
      <Routes>
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Implementation Trail */}
        <Route path="/implementation-trail" element={<ImplementationTrailPage />} />
        
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
