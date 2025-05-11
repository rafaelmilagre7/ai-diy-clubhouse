
import React from 'react';
import { NPSScoreChart } from './NPSScoreChart';
import { NPSPerLessonChart } from './NPSPerLessonChart';
import { LmsStatCards } from './LmsStatCards';
import { LessonFeedbackTable } from './LessonFeedbackTable';
import { useLmsAnalyticsData } from '@/hooks/analytics/lms/useLmsAnalyticsData';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface LmsAnalyticsTabContentProps {
  timeRange: string;
}

export const LmsAnalyticsTabContent: React.FC<LmsAnalyticsTabContentProps> = ({ timeRange }) => {
  const { npsData, statsData, feedbackData, isLoading } = useLmsAnalyticsData(timeRange);
  
  const hasData = !isLoading && (
    npsData.perLesson.length > 0 || 
    feedbackData.length > 0 || 
    statsData.totalStudents > 0 || 
    statsData.totalLessons > 0
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Análise do LMS</h2>
      
      {/* Estatísticas principais */}
      <LmsStatCards stats={statsData} isLoading={isLoading} />
      
      {!hasData && !isLoading ? (
        <Alert className="mb-6">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Sem dados disponíveis</AlertTitle>
          <AlertDescription>
            Não foram encontrados dados de análise do LMS para o período selecionado. 
            Tente selecionar um período diferente ou verificar se existem registros no sistema.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Destaque do NPS - Score geral e distribuição */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NPSScoreChart npsData={npsData} isLoading={isLoading} />
            <NPSPerLessonChart npsData={npsData} isLoading={isLoading} />
          </div>
          
          {/* Tabela de feedback */}
          <LessonFeedbackTable feedbackData={feedbackData} isLoading={isLoading} />
        </>
      )}
    </div>
  );
};
