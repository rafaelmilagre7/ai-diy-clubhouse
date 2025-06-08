
import React from 'react';
import { PrioritySection } from '../PrioritySection';

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
    <div className="space-y-12">
      <div className="animate-fade-in">
        <PrioritySection
          title="🎯 Prioridade 1: Comece por aqui"
          subtitle="Estas soluções foram selecionadas para gerar resultados imediatos"
          recommendations={trail.priority1}
          priority={1}
          accentColor="border-green-500/40 bg-green-500/5"
          iconColor="text-green-400"
        />
      </div>

      <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
        <PrioritySection
          title="🚀 Prioridade 2: Próximos passos"
          subtitle="Soluções complementares para expandir seus resultados"
          recommendations={trail.priority2}
          priority={2}
          accentColor="border-blue-500/40 bg-blue-500/5"
          iconColor="text-blue-400"
        />
      </div>

      <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
        <PrioritySection
          title="💎 Prioridade 3: Para o futuro"
          subtitle="Soluções avançadas para maximizar sua estratégia"
          recommendations={trail.priority3}
          priority={3}
          accentColor="border-purple-500/40 bg-purple-500/5"
          iconColor="text-purple-400"
        />
      </div>
    </div>
  );
};
