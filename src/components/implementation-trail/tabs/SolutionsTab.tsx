
import React from 'react';
import { SmartPrioritySection } from '../SmartPrioritySection';

interface ImplementationTrail {
  priority1: Array<{
    solutionId: string;
    justification: string;
    aiScore?: number;
    estimatedTime?: string;
  }>;
  priority2: Array<{
    solutionId: string;
    justification: string;
    aiScore?: number;
    estimatedTime?: string;
  }>;
  priority3: Array<{
    solutionId: string;
    justification: string;
    aiScore?: number;
    estimatedTime?: string;
  }>;
}

interface SolutionsTabProps {
  trail: ImplementationTrail;
}

export const SolutionsTab = ({ trail }: SolutionsTabProps) => {
  return (
    <div className="space-y-8">
      <div className="animate-fade-in">
        <SmartPrioritySection
          title="🎯 Prioridade Alta"
          subtitle="Implementação imediata recomendada pela IA"
          recommendations={trail.priority1}
          priority="priority1"
        />
      </div>

      <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
        <SmartPrioritySection
          title="🚀 Prioridade Média"
          subtitle="Soluções complementares para expandir seus resultados"
          recommendations={trail.priority2}
          priority="priority2"
        />
      </div>

      <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
        <SmartPrioritySection
          title="💎 Prioridade Baixa"
          subtitle="Planejamento para médio e longo prazo"
          recommendations={trail.priority3}
          priority="priority3"
        />
      </div>
    </div>
  );
};
