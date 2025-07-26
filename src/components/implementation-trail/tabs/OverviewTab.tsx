
import React from 'react';
import { PersonalizationInsights } from '../PersonalizationInsights';
import { ImplementationTrailData } from '@/types/implementationTrail';

interface OverviewTabProps {
  trail: ImplementationTrailData;
}

export const OverviewTab = ({ trail }: OverviewTabProps) => {
  return (
    <PersonalizationInsights trail={trail} />
  );
};
