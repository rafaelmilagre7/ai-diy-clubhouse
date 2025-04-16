
import React from "react";

export const ModuleTitle = ({ type }: { type: string }) => {
  // Mapeamento de tipos de módulos para títulos mais amigáveis
  const titles: Record<string, string> = {
    "landing": "Visão Geral da Solução",
    "overview": "Visão Geral e Case Real",
    "preparation": "Preparação Express",
    "implementation": "Implementação Passo a Passo",
    "verification": "Verificação de Implementação",
    "results": "Primeiros Resultados",
    "optimization": "Otimização Rápida",
    "celebration": "Celebração e Próximos Passos"
  };

  return <>{titles[type] || "Módulo"}</>;
};
