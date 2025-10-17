import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { NPSByCourse } from '@/hooks/analytics/lms/types';
import { BookOpen } from 'lucide-react';

interface NPSByCourseChartProps {
  data: NPSByCourse[];
  isLoading: boolean;
}

export const NPSByCourseChart: React.FC<NPSByCourseChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            NPS por Curso
          </CardTitle>
          <CardDescription>Score agregado de cada curso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-chart-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            NPS por Curso
          </CardTitle>
          <CardDescription>Score agregado de cada curso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-chart-lg flex items-center justify-center text-muted-foreground">
            Sem dados disponíveis para o período selecionado
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ordenar por NPS (do maior para o menor)
  const sortedData = [...data].sort((a, b) => b.nps_score - a.nps_score);

  const chartData = sortedData.map(item => ({
    course: item.course_title.length > 30 
      ? item.course_title.substring(0, 30) + '...' 
      : item.course_title,
    fullCourse: item.course_title,
    nps: item.nps_score,
    responses: item.total_responses
  }));

  const getBarColor = (nps: number) => {
    if (nps >= 50) return 'hsl(142, 76%, 36%)'; // green
    if (nps >= 0) return 'hsl(48, 96%, 53%)'; // yellow
    return 'hsl(0, 84%, 60%)'; // red
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
          <p className="font-semibold text-foreground text-sm mb-1">
            {payload[0].payload.fullCourse}
          </p>
          <p className="text-sm font-bold" style={{ color: getBarColor(payload[0].value) }}>
            NPS: {payload[0].value.toFixed(1)}
          </p>
          <p className="text-xs text-muted-foreground">
            {payload[0].payload.responses} respostas
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          NPS por Curso
        </CardTitle>
        <CardDescription>Score agregado de cada curso (ordenado por NPS)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={chartData} 
            margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
            layout="horizontal"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="course" 
              angle={-45}
              textAnchor="end"
              height={100}
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
            />
            <YAxis 
              domain={[-100, 100]}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="nps" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.nps)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
