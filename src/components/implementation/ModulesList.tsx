
import React from "react";

interface ModulesListProps {
  activeModule: number;
}

export const ModulesList = ({ activeModule }: ModulesListProps) => {
  const modules = [
    { id: 1, name: "Início", description: "Onde você está agora" },
    { id: 2, name: "Visão Geral", description: "Entenda o valor e contexto" },
    { id: 3, name: "Preparação", description: "Configure seu ambiente" },
    { id: 4, name: "Implementação", description: "Guia passo a passo" },
    { id: 5, name: "Verificação", description: "Confirme que está funcionando" },
    { id: 6, name: "Resultados", description: "Extraia valor imediato" },
    { id: 7, name: "Otimização", description: "Melhore o desempenho" },
    { id: 8, name: "Celebração", description: "Comemore seu sucesso" },
  ];

  return (
    <div className="flex flex-col items-center space-y-2">
      <p className="text-muted-foreground">Esta implementação tem 8 módulos:</p>
      <ol className="space-y-2 text-left">
        {modules.map((module) => (
          <li key={module.id} className="flex items-center">
            <span 
              className={`${
                module.id === activeModule ? "bg-aurora-primary" : "bg-secondary"
              } text-${
                module.id === activeModule ? "white" : "secondary-foreground"
              } rounded-full h-6 w-6 flex items-center justify-center mr-2`}
            >
              {module.id}
            </span>
            <span>{module.name} - {module.description}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};
