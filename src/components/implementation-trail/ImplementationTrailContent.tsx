
import React from 'react';
import { ImplementationTrailTabs } from './ImplementationTrailTabs';
import { OptimizedTrailProvider } from './OptimizedTrailProvider';
import { ImplementationTrailData } from '@/types/implementationTrail';

interface ImplementationTrailContentProps {
  trail: ImplementationTrailData;
}

export const ImplementationTrailContent = ({ trail }: ImplementationTrailContentProps) => {
  return (
    <OptimizedTrailProvider>
      <div className="space-y-6 pb-8">
        <ImplementationTrailTabs trail={trail} />
      </div>
    </OptimizedTrailProvider>
  );
};
