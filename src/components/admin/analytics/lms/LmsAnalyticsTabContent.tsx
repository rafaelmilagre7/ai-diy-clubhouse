
import React, { useCallback } from 'react';
import { NPSScoreChart } from './NPSScoreChart';
import { NPSPerLessonChart } from './NPSPerLessonChart';
import { LmsStatCards } from './LmsStatCards';
import { LessonFeedbackTable } from './LessonFeedbackTable';
import { useLmsAnalyticsData } from '@/hooks/analytics/lms/useLmsAnalyticsData';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface LmsAnalyticsTabContentProps {
  timeRange: string;
}

export const LmsAnalyticsTabContent: React.FC<LmsAnalyticsTabContentProps> = ({ timeRange }) => {
  const { toast } = useToast();
  const { npsData, statsData, feedbackData, isLoading, refresh } = useLmsAnalyticsData(timeRange);
  
  // Verificar se temos dados suficientes para exibir
  const hasData = !isLoading && (
    npsData.perLesson.length > 0 || 
    feedbackData.length > 0 || 
    statsData.totalStudents > 0 || 
    statsData.totalLessons > 0 ||
    statsData.completionRate > 0 ||
    npsData.overall !== 0
  );

  // Método para atualizar dados
  const handleRefresh = useCallback(() => {
    toast({
      title: "Atualizando dados LMS",
      description: "Os dados de análise do LMS estão sendo atualizados...",
    });
    refresh();
  }, [refresh, toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Análise do LMS</h2>
        <Button 
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar dados
        </Button>
      </div>
      
      {/* Estatísticas principais */}
      <LmsStatCards stats={statsData} isLoading={isLoading} />
      
      {!hasData && !isLoading ? (
        <Alert className="mb-6">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Sem dados disponíveis</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              Não foram encontrados dados de análise do LMS para o período selecionado. 
              Tente selecionar um período diferente ou verificar se existem registros no sistema.
            </p>
            <p className="text-sm">
              Nota: Os dados mostrados são simulados para demonstração da interface.
            </p>
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
