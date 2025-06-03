
import React from 'react';
import { Routes, Route } from 'react-router-dom';

const NetworkingRoutes = () => {
  return (
    <div className="container py-8">
      <Routes>
        <Route index element={
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Networking</h1>
            <p className="text-muted-foreground mb-8">
              Conecte-se com outros empresários e especialistas em IA
            </p>
            <div className="bg-card p-8 rounded-lg border">
              <p className="text-lg">
                Rede de contatos e colaboração em desenvolvimento
              </p>
            </div>
          </div>
        } />
        <Route path="*" element={
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Rede de Contatos</h1>
            <p className="text-muted-foreground">
              Funcionalidade de networking em desenvolvimento
            </p>
          </div>
        } />
      </Routes>
    </div>
  );
};

export default NetworkingRoutes;
