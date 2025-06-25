
import React from 'react';
import { useLmsAnalyticsData } from '@/hooks/analytics/lms/useLmsAnalyticsData';
import { useNpsData } from '@/hooks/analytics/lms/useNpsData';
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
  const { totalCourses, totalStudents, isLoading: dataLoading } = useLmsAnalyticsData(timeRange);
  const { data: npsResult, isLoading: npsLoading, error: npsError } = useNpsData(null);
  const { feedback, loading: feedbackLoading, error: feedbackError } = useLessonFeedback();

  const loading = dataLoading || npsLoading || feedbackLoading;
  const error = npsError || feedbackError;

  if (loading) {
    return <LoadingScreen variant="modern" type="full" fullScreen={false} />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="border-0 shadow-xl bg-red-50/80 backdrop-blur-sm">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar dados</AlertTitle>
        <AlertDescription>
          {typeof error === 'string' ? error : 'Erro ao carregar dados do LMS'}
        </AlertDescription>
      </Alert>
    );
  }

  const avgNPS = npsResult?.npsData?.overall || 0;
  const totalResponses = npsResult?.npsData?.distribution ? 
    (npsResult.npsData.distribution.promoters + npsResult.npsData.distribution.neutrals + npsResult.npsData.distribution.detractors) : 0;

  return (
    <div className="space-y-8">
      {/* Stats modernas */}
      <LmsStatCards
        totalCourses={totalCourses}
        totalStudents={totalStudents}
        avgNPS={avgNPS}
        totalResponses={totalResponses}
      />

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NPSScoreChart 
          npsData={npsResult?.npsData || { overall: 0, distribution: { promoters: 0, neutrals: 0, detractors: 0 } }} 
          isLoading={npsLoading}
        />
        <NPSPerLessonChart 
          npsData={{ perLesson: npsResult?.npsData?.perLesson || [] }} 
          isLoading={npsLoading}
        />
      </div>

      {/* Tabela de feedback */}
      <div>
        <LessonFeedbackTable 
          feedbackData={npsResult?.feedbackData || []} 
          isLoading={npsLoading}
        />
      </div>
    </div>
  );
};
