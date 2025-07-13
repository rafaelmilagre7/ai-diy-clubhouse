
import React from 'react';
import { PersonalizationInsights } from '../PersonalizationInsights';

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

interface OverviewTabProps {
  trail: ImplementationTrail;
}

export const OverviewTab = ({ trail }: OverviewTabProps) => {
  return (
    <PersonalizationInsights trail={trail} />
  );
};
