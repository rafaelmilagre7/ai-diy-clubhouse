
import React from 'react';
import { Routes, Route } from 'react-router-dom';

const FormacaoRoutes = () => {
  return (
    <Routes>
      <Route index element={<div>Formacao Dashboard</div>} />
      <Route path="*" element={<div>Formacao Page</div>} />
    </Routes>
  );
};

export default FormacaoRoutes;
