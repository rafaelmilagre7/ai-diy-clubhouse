
import React from 'react';
import { ImplementationTrailTabs } from './ImplementationTrailTabs';
import { SolutionDataProvider } from './contexts/SolutionDataContext';
import { ImplementationTrailData } from '@/types/implementationTrail';

interface ImplementationTrailContentProps {
  trail: ImplementationTrailData;
}

export const ImplementationTrailContent = ({ trail }: ImplementationTrailContentProps) => {
  return (
    <SolutionDataProvider>
      <div className="space-y-6 pb-8">
        <ImplementationTrailTabs trail={trail} />
      </div>
    </SolutionDataProvider>
  );
};
