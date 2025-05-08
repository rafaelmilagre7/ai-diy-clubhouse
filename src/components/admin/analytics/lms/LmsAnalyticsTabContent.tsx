
import React from 'react';
import { NPSScoreChart } from './NPSScoreChart';
import { NPSPerLessonChart } from './NPSPerLessonChart';
import { LmsStatCards } from './LmsStatCards';
import { LessonFeedbackTable } from './LessonFeedbackTable';
import { useLmsAnalyticsData } from '@/hooks/analytics/useLmsAnalyticsData';

interface LmsAnalyticsTabContentProps {
  timeRange: string;
}

export const LmsAnalyticsTabContent: React.FC<LmsAnalyticsTabContentProps> = ({ timeRange }) => {
  const { npsData, statsData, feedbackData, isLoading } = useLmsAnalyticsData(timeRange);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Análise do LMS</h2>
      
      {/* Estatísticas principais */}
      <LmsStatCards stats={statsData} isLoading={isLoading} />
      
      {/* Destaque do NPS - Score geral e distribuição */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NPSScoreChart npsData={npsData} isLoading={isLoading} />
        <NPSPerLessonChart npsData={npsData} isLoading={isLoading} />
      </div>
      
      {/* Tabela de feedback */}
      <LessonFeedbackTable feedbackData={feedbackData} isLoading={isLoading} />
    </div>
  );
};
