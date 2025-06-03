
import React from 'react';
import { Routes, Route } from 'react-router-dom';

const ProfileRoutes = () => {
  return (
    <Routes>
      <Route index element={<div>Profile Home</div>} />
      <Route path="*" element={<div>Profile Page</div>} />
    </Routes>
  );
};

export default ProfileRoutes;
