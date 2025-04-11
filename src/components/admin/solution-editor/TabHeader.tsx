
import React from "react";
import { moduleTypes } from "@/components/admin/solution/moduleTypes";

interface TabHeaderProps {
  currentStep: number;
}

const TabHeader: React.FC<TabHeaderProps> = ({ currentStep }) => {
  // Função para mostrar o título da etapa atual baseado no currentStep
  const getTabTitle = () => {
    const titles = [
      "Etapa 1: Configuração Básica",
      "Etapa 2: Landing da Solução",
      "Etapa 3: Visão Geral e Case",
      "Etapa 4: Preparação Express",
      "Etapa 5: Implementação Passo a Passo",
      "Etapa 6: Verificação de Implementação",
      "Etapa 7: Primeiros Resultados",
      "Etapa 8: Otimização Rápida",
      "Etapa 9: Celebração e Próximos Passos",
      "Etapa 10: Revisão e Publicação"
    ];
    
    return titles[currentStep] || "Configuração da Solução";
  };

  const currentModuleType = currentStep > 0 && currentStep < 9 
    ? moduleTypes[currentStep - 1].type 
    : null;

  return (
    <div className="px-6 pt-4 pb-2 border-b">
      <h2 className="text-xl font-semibold text-[#0ABAB5]">{getTabTitle()}</h2>
      {currentModuleType && (
        <p className="text-sm text-muted-foreground mt-1">
          Configurando o módulo de {moduleTypes.find(m => m.type === currentModuleType)?.title || ''}
        </p>
      )}
    </div>
  );
};

export default TabHeader;
