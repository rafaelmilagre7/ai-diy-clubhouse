
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MemberLayout } from '@/components/layout/member/MemberLayout';

// Dashboard
import Dashboard from '@/pages/member/Dashboard';

// Learning
import MemberLearning from '@/pages/member/MemberLearning';
import MemberCourseDetails from '@/pages/member/MemberCourseDetails';
import MemberLessonView from '@/pages/member/MemberLessonView';
import MemberCertificates from '@/pages/member/MemberCertificates';

// Suggestions - Sistema Completo
import Suggestions from '@/pages/member/Suggestions';
import NewSuggestion from '@/pages/member/NewSuggestion';
import SuggestionDetails from '@/pages/member/SuggestionDetails';

// Solutions
import Solutions from '@/pages/member/Solutions';
import SolutionDetails from '@/pages/member/SolutionDetails';

// Implementation
import ImplementationDetails from '@/pages/member/ImplementationDetails';
import ImplementationTrail from '@/pages/member/ImplementationTrail';

// Tools
import Tools from '@/pages/member/Tools';

// Community
import Community from '@/pages/member/Community';
import CategoryView from '@/pages/member/CategoryView';
import TopicView from '@/pages/member/TopicView';
import NewTopic from '@/pages/member/NewTopic';

// Networking
import Networking from '@/pages/member/Networking';

// Events
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
        
        {/* Learning */}
        <Route path="/learning" element={<MemberLearning />} />
        <Route path="/learning/course/:courseId" element={<MemberCourseDetails />} />
        <Route path="/learning/lesson/:lessonId" element={<MemberLessonView />} />
        <Route path="/learning/certificates" element={<MemberCertificates />} />

        {/* Suggestions - Sistema Completo */}
        <Route path="/suggestions" element={<Suggestions />} />
        <Route path="/suggestions/new" element={<NewSuggestion />} />
        <Route path="/suggestions/:id" element={<SuggestionDetails />} />

        {/* Solutions */}
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/solutions/:id" element={<SolutionDetails />} />

        {/* Implementation */}
        <Route path="/implementation/:id" element={<ImplementationDetails />} />
        <Route path="/implementation-trail" element={<ImplementationTrail />} />

        {/* Tools */}
        <Route path="/tools" element={<Tools />} />

        {/* Community */}
        <Route path="/comunidade" element={<Community />} />
        <Route path="/comunidade/categoria/:categorySlug" element={<CategoryView />} />
        <Route path="/comunidade/topico/:topicId" element={<TopicView />} />
        <Route path="/comunidade/novo-topico/:categorySlug" element={<NewTopic />} />

        {/* Networking */}
        <Route path="/networking" element={<Networking />} />

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
