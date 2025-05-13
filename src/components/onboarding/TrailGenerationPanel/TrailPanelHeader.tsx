
import React from 'react';

export const TrailPanelHeader = () => {
  return (
    <div className="mb-8 text-center">
      <h2 className="text-3xl font-bold font-heading bg-gradient-to-r from-[#0ABAB5] via-[#34D399] to-[#0ABAB5] bg-clip-text text-transparent mb-3">
        Trilha Personalizada VIVER DE IA
      </h2>
      <p className="text-neutral-400 max-w-2xl mx-auto">
        Baseada no seu perfil, selecionamos as melhores soluções para impulsionar seu negócio com inteligência artificial.
        Comece implementando as soluções de alta prioridade para resultados mais rápidos.
      </p>
      <div className="mt-4 flex items-center justify-center">
        <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-[#0ABAB5]/30 to-transparent"></div>
      </div>
    </div>
  );
};
