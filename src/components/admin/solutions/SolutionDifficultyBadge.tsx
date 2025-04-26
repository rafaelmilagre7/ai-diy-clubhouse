
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { difficultyLabels } from '@/utils/difficultyUtils';

interface SolutionDifficultyBadgeProps {
  difficulty: string;
}

export const SolutionDifficultyBadge: React.FC<SolutionDifficultyBadgeProps> = ({ difficulty }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Badge className={getDifficultyColor(difficulty)}>
      {difficultyLabels[difficulty] || difficulty}
    </Badge>
  );
};
