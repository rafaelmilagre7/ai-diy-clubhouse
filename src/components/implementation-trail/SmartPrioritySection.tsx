import React from 'react';
import { SmartSolutionCard } from './SmartSolutionCard';
import { useSolutionData } from '@/hooks/implementation-trail/useSolutionData';
import { Skeleton } from '@/components/ui/skeleton';

interface Recommendation {
  solutionId: string;
  justification: string;
  aiScore?: number;
  estimatedTime?: string;
}

interface SmartPrioritySectionProps {
  title: string;
  subtitle: string;
  recommendations: Recommendation[];
  priority: 'priority1' | 'priority2' | 'priority3';
}

export const SmartPrioritySection = ({
  title,
  subtitle,
  recommendations,
  priority
}: SmartPrioritySectionProps) => {
  const solutionIds = recommendations.map(rec => rec.solutionId);
  const { solutions, loading } = useSolutionData(solutionIds);

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-high-contrast mb-2">{title}</h2>
          <p className="text-medium-contrast">{subtitle}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {recommendations.map((_, index) => (
            <Skeleton key={index} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-high-contrast mb-2">{title}</h2>
          <p className="text-medium-contrast">{subtitle}</p>
        </div>
        <div className="text-center py-8 text-medium-contrast">
          <p>Nenhuma solução encontrada para esta prioridade.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-high-contrast mb-2">{title}</h2>
        <p className="text-medium-contrast">{subtitle}</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {recommendations.map((recommendation) => {
          const solution = solutions[recommendation.solutionId];
          
          if (!solution) {
            return (
              <div key={recommendation.solutionId} className="p-4 border rounded-lg bg-gray-50">
                <p className="text-medium-contrast">
                  Solução não encontrada (ID: {recommendation.solutionId})
                </p>
              </div>
            );
          }

          return (
            <SmartSolutionCard
              key={recommendation.solutionId}
              solution={solution}
              priority={priority}
              aiScore={recommendation.aiScore || 0}
              estimatedTime={recommendation.estimatedTime || 'Não especificado'}
              justification={recommendation.justification}
            />
          );
        })}
      </div>
    </div>
  );
};