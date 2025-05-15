
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
    easy: "bg-green-900/40 text-green-300 border-green-700",
    medium: "bg-amber-900/40 text-amber-300 border-amber-700", 
    advanced: "bg-red-900/40 text-red-300 border-red-700",
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
