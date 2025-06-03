
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import FormacaoDashboard from '@/pages/formacao/FormacaoDashboard';

export const FormacaoRoutes = () => {
  return (
    <Routes>
      <Route index element={<FormacaoDashboard />} />
    </Routes>
  );
};

export default FormacaoRoutes;
