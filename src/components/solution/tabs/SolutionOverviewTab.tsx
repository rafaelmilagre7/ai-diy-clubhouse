
import React from 'react';
import { Solution } from '@/types/solution';

interface SolutionOverviewTabProps {
  solution: Solution;
}

const SolutionOverviewTab: React.FC<SolutionOverviewTabProps> = ({ solution }) => {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold">Sobre esta Solução</h2>
      
      <div className="prose prose-sm max-w-none text-muted-foreground">
        <p>{solution.description}</p>
      </div>

      {solution.overview && (
        <div className="mt-6">
          <div className="prose prose-sm max-w-none text-foreground" 
               dangerouslySetInnerHTML={{ __html: solution.overview }} />
        </div>
      )}
      
      {solution.implementation_steps && solution.implementation_steps.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-2">Etapas de Implementação</h3>
          <ol className="space-y-3">
            {solution.implementation_steps.map((step: any, index: number) => (
              <li key={step.id || index} className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-medium mr-3">
                  {index + 1}
                </span>
                <span>{step.title}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      
      {solution.prerequisites && solution.prerequisites.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Pré-requisitos</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            {solution.prerequisites.map((prerequisite: any, index: number) => (
              <li key={prerequisite.id || index}>{prerequisite.text}</li>
            ))}
          </ul>
        </div>
      )}
      
      {solution.completion_criteria && solution.completion_criteria.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Critérios de Conclusão</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            {solution.completion_criteria.map((criteria: any, index: number) => (
              <li key={criteria.id || index}>{criteria.text}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SolutionOverviewTab;
