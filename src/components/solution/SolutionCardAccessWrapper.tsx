
import React from 'react';
import { Solution } from '@/lib/supabase';
import { SolutionCard } from './SolutionCard';
import { useSolutionSpecificAccess } from '@/hooks/auth/useSolutionSpecificAccess';

interface SolutionCardAccessWrapperProps {
  solution: Solution;
  generalHasAccess?: boolean;
  onUpgradeRequired?: () => void;
}

// Wrapper que combina acesso geral (feature) + acesso específico por solução
export const SolutionCardAccessWrapper: React.FC<SolutionCardAccessWrapperProps> = ({
  solution,
  generalHasAccess = false,
  onUpgradeRequired,
}) => {
  const { hasAccess: specificAccess } = useSolutionSpecificAccess(solution.id);

  const effectiveHasAccess = generalHasAccess || specificAccess;

  return (
    <SolutionCard
      solution={solution}
      hasAccess={effectiveHasAccess}
      onUpgradeRequired={onUpgradeRequired}
    />
  );
};
