
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Profile from '@/pages/member/Profile';
import EditProfile from '@/pages/member/EditProfile';

export const ProfileRoutes = () => {
  return (
    <Routes>
      <Route index element={<Profile />} />
      <Route path="edit" element={<EditProfile />} />
    </Routes>
  );
};
