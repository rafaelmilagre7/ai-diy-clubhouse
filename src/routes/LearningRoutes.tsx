
import React from 'react';
import { Routes, Route } from 'react-router-dom';

const LearningRoutes = () => {
  return (
    <div className="container py-8">
      <Routes>
        <Route index element={
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Área de Aprendizado</h1>
            <p className="text-muted-foreground">
              Bem-vindo à área de cursos e conteúdos educacionais do Viver de IA
            </p>
          </div>
        } />
        <Route path="*" element={
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Página de Aprendizado</h1>
            <p className="text-muted-foreground">
              Conteúdo em desenvolvimento
            </p>
          </div>
        } />
      </Routes>
    </div>
  );
};

export default LearningRoutes;
