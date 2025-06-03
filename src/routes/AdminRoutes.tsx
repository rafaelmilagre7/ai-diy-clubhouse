
import React from 'react';
import { Routes, Route } from 'react-router-dom';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route index element={<div>Admin Dashboard</div>} />
      <Route path="*" element={<div>Admin Page</div>} />
    </Routes>
  );
};

export default AdminRoutes;
