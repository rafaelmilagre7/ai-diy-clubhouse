
import React, { memo, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DifficultyBadgeProps {
  difficulty: string;
}

// Componente memoizado para badge de dificuldade
export const DifficultyBadge = memo<DifficultyBadgeProps>(({ difficulty }) => {
  // Memoizar configurações do badge
  const badgeConfig = useMemo(() => {
    switch (difficulty) {
      case 'easy':
        return {
          label: 'Fácil',
          className: 'bg-green-900/40 text-green-300 border-green-700'
        };
      case 'medium':
        return {
          label: 'Médio',
          className: 'bg-amber-900/40 text-amber-300 border-amber-700'
        };
      case 'advanced':
        return {
          label: 'Avançado',
          className: 'bg-red-900/40 text-red-300 border-red-700'
        };
      default:
        return {
          label: difficulty,
          className: 'bg-neutral-900/40 text-neutral-300 border-neutral-700'
        };
    }
  }, [difficulty]);

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "px-2 py-0.5 text-xs font-medium rounded-full",
        badgeConfig.className
      )}
    >
      {badgeConfig.label}
    </Badge>
  );
});

DifficultyBadge.displayName = 'DifficultyBadge';
