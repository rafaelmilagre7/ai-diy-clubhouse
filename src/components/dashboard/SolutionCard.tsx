import React, { memo } from 'react';
import { Solution } from '@/lib/supabase';
import { FloatingGlassCard } from '@/components/solution/FloatingGlassCard';

interface SolutionCardProps {
  solution: Solution;
  onClick: () => void;
}

export const SolutionCard = memo<SolutionCardProps>(({ solution, onClick }) => {
  return <FloatingGlassCard solution={solution} onClick={onClick} />;
});

SolutionCard.displayName = 'SolutionCard';
