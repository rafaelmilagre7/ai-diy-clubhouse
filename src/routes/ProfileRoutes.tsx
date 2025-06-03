
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Profile from '@/pages/member/Profile';
import EditProfile from '@/pages/member/EditProfile';
import OnboardingReview from '@/pages/member/OnboardingReview';

const ProfileRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<Profile />} />
      <Route path="edit" element={<EditProfile />} />
      <Route path="onboarding-review" element={<OnboardingReview />} />
    </Routes>
  );
};

export default ProfileRoutes;
