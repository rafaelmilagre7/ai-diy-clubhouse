
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface SolutionDifficultyBadgeProps {
  difficulty: string;
}

export const SolutionDifficultyBadge: React.FC<SolutionDifficultyBadgeProps> = ({ difficulty }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
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
