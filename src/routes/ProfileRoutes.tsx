
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MemberLayout from '@/components/layout/MemberLayout';
import Profile from '@/pages/member/Profile';
import EditProfile from '@/pages/member/EditProfile';

export const ProfileRoutes = () => {
  return (
    <Routes>
      <Route index element={
        <MemberLayout>
          <Profile />
        </MemberLayout>
      } />
      
      <Route path="edit" element={
        <MemberLayout>
          <EditProfile />
        </MemberLayout>
      } />
    </Routes>
  );
};
