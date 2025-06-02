
import React from 'react';
import { Routes, Route } from 'react-router-dom';

export const AdminRoutes = () => {
  return (
    <Routes>
      <Route index element={<div>Admin Dashboard</div>} />
    </Routes>
  );
};
