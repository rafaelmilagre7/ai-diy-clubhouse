
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface SolutionDifficultyBadgeProps {
  difficulty: string;
}

export const SolutionDifficultyBadge: React.FC<SolutionDifficultyBadgeProps> = ({ difficulty }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-300'; // Melhor contraste
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-300'; // Melhor contraste
      case 'advanced': return 'bg-red-100 text-red-800 border-red-300'; // Melhor contraste
      default: return 'bg-gray-100 text-gray-800 border-gray-300'; // Melhor contraste
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
