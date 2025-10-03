import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { NPSCourseEvolution } from '@/hooks/analytics/lms/types';
import { Activity } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface NPSEvolutionByCourseChartProps {
  data: NPSCourseEvolution[];
  isLoading: boolean;
}

export const NPSEvolutionByCourseChart: React.FC<NPSEvolutionByCourseChartProps> = ({ 
  data, 
  isLoading 
}) => {
  // Obter lista única de cursos
  const allCourses = React.useMemo(() => {
    const courseMap = new Map<string, string>();
    data.forEach(item => {
      courseMap.set(item.course_id, item.course_title);
    });
    return Array.from(courseMap.entries()).map(([id, title]) => ({ id, title }));
  }, [data]);

  // Inicializar com todos os cursos selecionados (máximo 5 para não poluir)
  const [selectedCourses, setSelectedCourses] = useState<string[]>(
    allCourses.slice(0, 5).map(c => c.id)
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Evolução do NPS por Curso
          </CardTitle>
          <CardDescription>Comparação temporal entre cursos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center">
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
            <Activity className="h-5 w-5" />
            Evolução do NPS por Curso
          </CardTitle>
          <CardDescription>Comparação temporal entre cursos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] flex items-center justify-center text-muted-foreground">
            Sem dados disponíveis para o período selecionado
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filtrar dados pelos cursos selecionados
  const filteredData = data.filter(item => selectedCourses.includes(item.course_id));

  // Agrupar dados por mês
  const groupedByMonth = filteredData.reduce((acc, item) => {
    const monthKey = format(new Date(item.month), 'MMM/yy', { locale: ptBR });
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey };
    }
    acc[monthKey][item.course_title] = item.nps_score;
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(groupedByMonth);

  // Cores para os cursos
  const courseColors = [
    'hsl(var(--primary))',
    'hsl(142, 76%, 36%)',
    'hsl(262, 83%, 58%)',
    'hsl(346, 87%, 43%)',
    'hsl(48, 96%, 53%)',
    'hsl(221, 83%, 53%)',
    'hsl(173, 58%, 39%)',
    'hsl(25, 95%, 53%)'
  ];

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground mb-2">{payload[0].payload.month}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-bold">{entry.value?.toFixed(1)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Evolução do NPS por Curso
        </CardTitle>
        <CardDescription>Comparação temporal entre cursos</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filtro de cursos */}
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">Selecione os cursos:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {allCourses.map((course) => (
              <div key={course.id} className="flex items-center space-x-2">
                <Checkbox
                  id={course.id}
                  checked={selectedCourses.includes(course.id)}
                  onCheckedChange={() => handleCourseToggle(course.id)}
                />
                <label
                  htmlFor={course.id}
                  className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {course.title.length > 30 
                    ? course.title.substring(0, 30) + '...' 
                    : course.title
                  }
                </label>
              </div>
            ))}
          </div>
        </div>

        {selectedCourses.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Selecione pelo menos um curso para visualizar
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                domain={[-100, 100]}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="line"
              />
              {allCourses
                .filter(course => selectedCourses.includes(course.id))
                .map((course, index) => (
                  <Line
                    key={course.id}
                    type="monotone"
                    dataKey={course.title}
                    stroke={courseColors[index % courseColors.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
