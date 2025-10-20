import React, { memo } from 'react';
import { Solution } from '@/lib/supabase';
import { AuroraGlassSolutionCard } from '@/components/solution/AuroraGlassSolutionCard';

interface SolutionCardProps {
  solution: Solution;
  onClick: () => void;
}

// Wrapper que mantém a interface existente mas usa o novo design
export const SolutionCard = memo<SolutionCardProps>(({ solution, onClick }) => {
  return <AuroraGlassSolutionCard solution={solution} onClick={onClick} />;
});

SolutionCard.displayName = 'SolutionCard';
