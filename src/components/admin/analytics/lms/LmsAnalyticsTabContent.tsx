
import React from 'react';
import { useLmsAnalyticsData } from '@/hooks/analytics/useLmsAnalyticsData';
import { useNPSData } from '@/hooks/analytics/useNPSData';
import { useLessonFeedback } from '@/hooks/analytics/useLessonFeedback';
import { LmsStatCards } from './LmsStatCards';
import LoadingScreen from '@/components/common/LoadingScreen';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { NPSScoreChart } from './NPSScoreChart';
import { NPSPerLessonChart } from './NPSPerLessonChart';
import { LessonFeedbackTable } from './LessonFeedbackTable';

interface LmsAnalyticsTabContentProps {
  timeRange: string;
}

export const LmsAnalyticsTabContent = ({ timeRange }: LmsAnalyticsTabContentProps) => {
  const { data, loading: dataLoading, error: dataError } = useLmsAnalyticsData(timeRange);
  const { data: npsData, loading: npsLoading, error: npsError } = useNPSData(timeRange);
  const { feedback, loading: feedbackLoading, error: feedbackError } = useLessonFeedback();

  const loading = dataLoading || npsLoading || feedbackLoading;
  const error = dataError || npsError || feedbackError;

  if (loading) {
    return <LoadingScreen variant="modern" type="full" fullScreen={false} />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="border-0 shadow-xl bg-red-50/80 backdrop-blur-sm">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar dados</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const avgNPS = npsData?.avg_nps || 0;
  const totalResponses = npsData?.total_responses || 0;

  return (
    <div className="space-y-8">
      {/* Stats modernas */}
      <LmsStatCards
        totalCourses={data.totalCourses}
        totalStudents={data.totalStudents}
        avgNPS={avgNPS}
        totalResponses={totalResponses}
      />

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NPSScoreChart 
          npsData={npsData?.overall_data || { overall: 0, distribution: { promoters: 0, neutrals: 0, detractors: 0 } }} 
          isLoading={npsLoading}
        />
        <NPSPerLessonChart 
          npsData={npsData?.per_lesson_data || { perLesson: [] }} 
          isLoading={npsLoading}
        />
      </div>

      {/* Tabela de feedback */}
      <div>
        <LessonFeedbackTable 
          feedbackData={feedback} 
          isLoading={feedbackLoading}
        />
      </div>
    </div>
  );
};
