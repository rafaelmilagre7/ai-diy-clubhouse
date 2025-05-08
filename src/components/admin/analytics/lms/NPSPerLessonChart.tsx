
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
    }>;
  };
  isLoading: boolean;
}

export const NPSPerLessonChart: React.FC<NPSPerLessonChartProps> = ({ npsData, isLoading }) => {
  // Preparar dados para o gráfico de barras
  const chartData = npsData.perLesson.slice(0, 10).map(lesson => ({
    lesson: lesson.lessonTitle.length > 20 
      ? `${lesson.lessonTitle.substring(0, 20)}...` 
      : lesson.lessonTitle,
    nps: lesson.npsScore
  }));
  
  // Determinar cores com base no score NPS
  const getBarColor = (npsScore: number) => {
    if (npsScore >= 50) return "#22c55e"; // Verde para bom
    if (npsScore >= 0) return "#f59e0b";  // Âmbar para médio
    return "#ef4444";                      // Vermelho para ruim
  };
  
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>NPS por Aula</CardTitle>
        <CardDescription>
          Score NPS para as 10 aulas mais avaliadas
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
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
            colors={[
              (context) => {
                const value = context.dataPoint?.value as number;
                return getBarColor(value);
              }
            ]}
            valueFormatter={(value) => `${value}`}
            layout="vertical"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Sem dados suficientes para exibir
          </div>
        )}
      </CardContent>
    </Card>
  );
};
