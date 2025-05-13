
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface SolutionDifficultyBadgeProps {
  difficulty: string;
}

export const SolutionDifficultyBadge: React.FC<SolutionDifficultyBadgeProps> = ({ difficulty }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-900/30 text-green-300';
      case 'medium': return 'bg-amber-900/30 text-amber-300';
      case 'advanced': return 'bg-red-900/30 text-red-300';
      default: return 'bg-gray-800/50 text-gray-300';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Normal';
      case 'advanced': return 'Avançado';
      default: return difficulty;
    }
  };

  return (
    <Badge className={getDifficultyColor(difficulty)}>
      {getDifficultyText(difficulty)}
    </Badge>
  );
};
