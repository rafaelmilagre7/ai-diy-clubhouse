
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ModernLogin from '@/pages/auth/ModernLogin';
import ResetPassword from '@/pages/auth/ResetPassword';
import SetNewPassword from '@/pages/auth/SetNewPassword';

export const AuthRoutes = () => {
  return (
    <Routes>
      {/* Removido conflito com /login principal - apenas rotas internas de auth */}
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/set-new-password" element={<SetNewPassword />} />
      {/* Fallback para qualquer rota auth não encontrada */}
      <Route path="*" element={<ModernLogin />} />
    </Routes>
  );
};
