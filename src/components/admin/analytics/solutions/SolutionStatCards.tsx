
import React from 'react';
import { ModernStatsCard } from '../ModernStatsCard';
import { BookOpen, FileCheck, Clock, Award } from 'lucide-react';

interface SolutionStatCardsProps {
  totalSolutions: number;
  publishedSolutions: number;
  drafts: number;
  avgCompletionRate: number;
  loading?: boolean;
}

export const SolutionStatCards: React.FC<SolutionStatCardsProps> = ({
  totalSolutions,
  publishedSolutions,
  drafts,
  avgCompletionRate,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <ModernStatsCard
            key={i}
            title="Carregando..."
            value="-"
            icon={BookOpen}
            colorScheme="blue"
            loading={true}
          />
        ))}
      </div>
    );
  }

  const publishRate = totalSolutions > 0 ? (publishedSolutions / totalSolutions) * 100 : 0;
  const draftRate = totalSolutions > 0 ? (drafts / totalSolutions) * 100 : 0;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <ModernStatsCard
        title="Total de Soluções"
        value={totalSolutions}
        icon={BookOpen}
        colorScheme="blue"
        trend={{
          value: totalSolutions,
          label: "soluções criadas",
          type: totalSolutions > 0 ? 'positive' : 'neutral'
        }}
      />
      
      <ModernStatsCard
        title="Soluções Publicadas"
        value={publishedSolutions}
        icon={FileCheck}
        colorScheme="green"
        trend={{
          value: Math.round(publishRate),
          label: "taxa de publicação",
          type: publishRate > 80 ? 'positive' : publishRate > 50 ? 'neutral' : 'negative'
        }}
      />
      
      <ModernStatsCard
        title="Rascunhos"
        value={drafts}
        icon={Clock}
        colorScheme="orange"
        trend={{
          value: Math.round(draftRate),
          label: "em desenvolvimento",
          type: draftRate < 20 ? 'positive' : draftRate < 50 ? 'neutral' : 'negative'
        }}
      />
      
      <ModernStatsCard
        title="Taxa Média de Conclusão"
        value={`${avgCompletionRate}%`}
        icon={Award}
        colorScheme="purple"
        trend={{
          value: avgCompletionRate,
          label: "média de conclusão",
          type: avgCompletionRate > 70 ? 'positive' : avgCompletionRate > 40 ? 'neutral' : 'negative'
        }}
      />
    </div>
  );
};
