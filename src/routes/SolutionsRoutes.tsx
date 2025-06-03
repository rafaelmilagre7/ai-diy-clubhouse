
import React from 'react';
import { Routes, Route } from 'react-router-dom';

const SolutionsRoutes = () => {
  return (
    <div className="container py-8">
      <Routes>
        <Route index element={
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Catálogo de Soluções</h1>
            <p className="text-muted-foreground mb-8">
              Explore soluções de IA prontas para implementar no seu negócio
            </p>
            <div className="bg-card p-8 rounded-lg border">
              <p className="text-lg">
                Em breve: catálogo completo de soluções de IA
              </p>
            </div>
          </div>
        } />
        <Route path="*" element={
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Soluções de IA</h1>
            <p className="text-muted-foreground">
              Página específica de solução em desenvolvimento
            </p>
          </div>
        } />
      </Routes>
    </div>
  );
};

export default SolutionsRoutes;
