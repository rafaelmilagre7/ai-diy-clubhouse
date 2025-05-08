
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import MemberLearningPage from '@/pages/formacao/MemberLearningPage';
import MemberLayout from '@/components/layout/MemberLayout';

// Importar outras páginas de membro conforme necessário

const MemberRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MemberLayout />}>
        <Route path="/learning" element={<MemberLearningPage />} />
        {/* Adicionar outras rotas de membro aqui */}
      </Route>
    </Routes>
  );
};

export default MemberRoutes;
