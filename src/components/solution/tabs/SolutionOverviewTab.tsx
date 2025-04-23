
import React from 'react';
import { Solution } from '@/types/solution';

interface SolutionOverviewTabProps {
  solution: Solution;
}

const SolutionOverviewTab: React.FC<SolutionOverviewTabProps> = ({ solution }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Visão Geral</h3>
        <p className="text-muted-foreground mt-2">
          {solution.overview || solution.description}
        </p>
      </div>

      {solution.prerequisites && solution.prerequisites.length > 0 && (
        <div>
          <h3 className="text-lg font-medium">Pré-requisitos</h3>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            {solution.prerequisites.map((prerequisite, index) => (
              <li key={prerequisite.id || index} className="text-muted-foreground">
                {prerequisite.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {solution.completion_criteria && solution.completion_criteria.length > 0 && (
        <div>
          <h3 className="text-lg font-medium">Critérios de Conclusão</h3>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            {solution.completion_criteria.map((criteria, index) => (
              <li key={criteria.id || index} className="text-muted-foreground">
                {criteria.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium">Informações Adicionais</h3>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <p className="text-sm font-medium">Tempo estimado</p>
            <p className="text-muted-foreground">{solution.estimated_time ? `${solution.estimated_time} minutos` : 'Não especificado'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Nível de dificuldade</p>
            <p className="text-muted-foreground capitalize">{solution.difficulty}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionOverviewTab;
