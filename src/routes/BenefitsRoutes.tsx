
import React from 'react';
import { Routes, Route } from 'react-router-dom';

const BenefitsRoutes = () => {
  return (
    <div className="container py-8">
      <Routes>
        <Route index element={
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Benefícios Exclusivos</h1>
            <p className="text-muted-foreground mb-8">
              Aproveite todos os benefícios da sua assinatura do Viver de IA
            </p>
            <div className="bg-card p-8 rounded-lg border">
              <p className="text-lg">
                Ferramentas, descontos e recursos exclusivos para membros
              </p>
            </div>
          </div>
        } />
        <Route path="*" element={
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Benefícios</h1>
            <p className="text-muted-foreground">
              Página específica de benefício em desenvolvimento
            </p>
          </div>
        } />
      </Routes>
    </div>
  );
};

export default BenefitsRoutes;
