
import React from 'react';
import { PrioritySection } from './PrioritySection';
import { RecommendedLessons } from './RecommendedLessons';
import { PersonalizedMessage } from './PersonalizedMessage';

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
  recommended_lessons?: Array<{
    lessonId: string;
    moduleId: string;
    courseId: string;
    title: string;
    justification: string;
    priority: number;
  }>;
  ai_message?: string;
  generated_at: string;
}

interface ImplementationTrailContentProps {
  trail: ImplementationTrail;
}

export const ImplementationTrailContent = ({ trail }: ImplementationTrailContentProps) => {
  return (
    <div className="space-y-8">
      {trail.ai_message && (
        <PersonalizedMessage message={trail.ai_message} />
      )}

      <div className="grid gap-6">
        <PrioritySection
          title="🎯 Prioridade 1: Comece por aqui"
          subtitle="Estas soluções foram selecionadas para gerar resultados imediatos"
          recommendations={trail.priority1}
          priority={1}
          accentColor="bg-green-500/20 border-green-500/30"
          iconColor="text-green-400"
        />

        <PrioritySection
          title="🚀 Prioridade 2: Próximos passos"
          subtitle="Soluções complementares para expandir seus resultados"
          recommendations={trail.priority2}
          priority={2}
          accentColor="bg-blue-500/20 border-blue-500/30"
          iconColor="text-blue-400"
        />

        <PrioritySection
          title="💎 Prioridade 3: Para o futuro"
          subtitle="Soluções avançadas para maximizar sua estratégia"
          recommendations={trail.priority3}
          priority={3}
          accentColor="bg-purple-500/20 border-purple-500/30"
          iconColor="text-purple-400"
        />
      </div>

      {trail.recommended_lessons && trail.recommended_lessons.length > 0 && (
        <RecommendedLessons lessons={trail.recommended_lessons} />
      )}
    </div>
  );
};
