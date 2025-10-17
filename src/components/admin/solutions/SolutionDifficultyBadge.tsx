
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SolutionDifficultyBadgeProps {
  difficulty: 'easy' | 'medium' | 'advanced' | string;
  className?: string;
}

export const SolutionDifficultyBadge: React.FC<SolutionDifficultyBadgeProps> = ({ 
  difficulty,
  className
}) => {
  const badgeStyles = {
    easy: "bg-difficulty-beginner/20 text-difficulty-beginner border-difficulty-beginner/30",
    medium: "bg-difficulty-intermediate/20 text-difficulty-intermediate border-difficulty-intermediate/30", 
    advanced: "bg-difficulty-advanced/20 text-difficulty-advanced border-difficulty-advanced/30",
  };
  
  const difficultyText = {
    easy: "Fácil",
    medium: "Médio",
    advanced: "Avançado"
  };
  
  const style = badgeStyles[difficulty as keyof typeof badgeStyles] || badgeStyles.medium;
  const text = difficultyText[difficulty as keyof typeof difficultyText] || difficulty;
  
  return (
    <Badge 
      variant="outline" 
      className={cn(style, "font-medium", className)}
    >
      {text}
    </Badge>
  );
};
