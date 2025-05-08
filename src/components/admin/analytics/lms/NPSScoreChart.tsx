
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from '@/components/ui/chart/pie-chart';
import { Skeleton } from '@/components/ui/skeleton';

interface NPSScoreChartProps {
  npsData: {
    overall: number;
    distribution: {
      promoters: number;
      neutrals: number;
      detractors: number;
    };
  };
  isLoading: boolean;
}

export const NPSScoreChart: React.FC<NPSScoreChartProps> = ({ npsData, isLoading }) => {
  const npsScoreColorClass = () => {
    if (npsData.overall >= 50) return "text-green-500";
    if (npsData.overall >= 0) return "text-amber-500";
    return "text-red-500";
  };
  
  const chartData = [
    { name: 'Promotores', value: npsData.distribution.promoters },
    { name: 'Neutros', value: npsData.distribution.neutrals },
    { name: 'Detratores', value: npsData.distribution.detractors }
  ];
  
  const chartColors = ['#22c55e', '#f59e0b', '#ef4444'];
  
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Score NPS - Distribuição</CardTitle>
        <CardDescription>
          NPS geral: {isLoading ? (
            <Skeleton className="h-5 w-14 inline-block" />
          ) : (
            <span className={`font-bold ${npsScoreColorClass()}`}>{npsData.overall}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center">
            <Skeleton className="h-[250px] w-[250px] rounded-full" />
          </div>
        ) : (
          <PieChart
            data={chartData}
            category="value"
            index="name"
            colors={chartColors}
            valueFormatter={(value) => `${value.toFixed(1)}%`}
          />
        )}
      </CardContent>
    </Card>
  );
};
