
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ModernLogin from '@/pages/auth/ModernLogin';
import ResetPassword from '@/pages/auth/ResetPassword';
import SetNewPassword from '@/pages/auth/SetNewPassword';

export const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<ModernLogin />} />
      {/* Removido o registro direto, acesso apenas por convite */}
      <Route path="/register" element={<ModernLogin />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/set-new-password" element={<SetNewPassword />} />
    </Routes>
  );
};
