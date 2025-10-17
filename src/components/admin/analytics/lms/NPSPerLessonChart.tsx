
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart } from '@/components/ui/chart/bar-chart';
import { Skeleton } from '@/components/ui/skeleton';

interface NPSPerLessonChartProps {
  npsData: {
    perLesson: Array<{
      lessonId: string;
      lessonTitle: string;
      npsScore: number;
      responseCount?: number;
    }>;
  };
  isLoading: boolean;
}

export const NPSPerLessonChart: React.FC<NPSPerLessonChartProps> = ({ npsData, isLoading }) => {
  // Preparar dados para o gráfico de barras
  const chartData = npsData.perLesson.slice(0, 10).map(lesson => ({
    lesson: lesson.lessonTitle && lesson.lessonTitle.length > 20 
      ? `${lesson.lessonTitle.substring(0, 20)}...` 
      : lesson.lessonTitle || `Aula ${lesson.lessonId.substring(0, 4)}`,
    nps: lesson.npsScore,
    respostas: lesson.responseCount || 0
  }));
  
  // Criar array de cores para o gráfico
  const barColors = ["hsl(var(--secondary))"]; // Cor do design system para todas as barras
  
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>NPS por Aula</CardTitle>
        <CardDescription>
          Score NPS para as {chartData.length > 0 ? chartData.length : 10} aulas mais avaliadas
        </CardDescription>
      </CardHeader>
      <CardContent className="h-chart-md">
        {isLoading ? (
          <div className="h-full w-full flex flex-col space-y-2 justify-center">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-11/12" />
            <Skeleton className="h-8 w-10/12" />
            <Skeleton className="h-8 w-9/12" />
            <Skeleton className="h-8 w-8/12" />
          </div>
        ) : chartData.length > 0 ? (
          <BarChart
            data={chartData}
            index="lesson"
            categories={["nps"]}
            colors={barColors}
            valueFormatter={(value) => `${value}`}
            layout="vertical"
            className="h-full"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
            <p className="mb-2">Sem avaliações de aulas para exibir</p>
            <p className="text-sm">
              As avaliações são coletadas ao final de cada aula através do formulário de NPS
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
