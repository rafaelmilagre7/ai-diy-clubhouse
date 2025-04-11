
import React from "react";

interface ModuleTitleProps {
  type: string;
}

export const ModuleTitle = ({ type }: ModuleTitleProps) => {
  switch (type) {
    case "landing":
      return <>Início</>;
    case "overview":
      return <>Visão Geral</>;
    case "preparation":
      return <>Preparação</>;
    case "implementation":
      return <>Implementação</>;
    case "verification":
      return <>Verificação</>;
    case "results":
      return <>Resultados</>;
    case "optimization":
      return <>Otimização</>;
    case "celebration":
      return <>Celebração</>;
    default:
      return <>{type}</>;
  }
};
