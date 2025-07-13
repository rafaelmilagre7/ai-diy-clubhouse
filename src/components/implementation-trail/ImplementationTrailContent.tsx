
import React from 'react';
import { ImplementationTrailTabs } from './ImplementationTrailTabs';
import { SolutionDataProvider } from './contexts/SolutionDataContext';

interface ImplementationTrail {
  priority1: Array<{
    solutionId: string;
    justification: string;
    aiScore?: number;
    estimatedTime?: string;
  }>;
  priority2: Array<{
    solutionId: string;
    justification: string;
    aiScore?: number;
    estimatedTime?: string;
  }>;
  priority3: Array<{
    solutionId: string;
    justification: string;
    aiScore?: number;
    estimatedTime?: string;
  }>;
  recommended_lessons?: Array<{
    lessonId: string;
    moduleId: string;
    courseId: string;
    title: string;
    justification: string;
    priority: number;
  }>;
  ai_message?: string;
  generated_at: string;
}

interface ImplementationTrailContentProps {
  trail: ImplementationTrail;
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
