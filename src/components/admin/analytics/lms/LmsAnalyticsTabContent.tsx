
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Users, Clock, TrendingUp } from 'lucide-react';

interface LmsAnalyticsTabContentProps {
  timeRange: string;
}

export const LmsAnalyticsTabContent = ({ timeRange }: LmsAnalyticsTabContentProps) => {
  // Dados mock para demonstração do LMS
  const mockLmsData = {
    totalCourses: 12,
    totalStudents: 156,
    averageCompletionTime: 45,
    completionRate: 78
  };

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Cursos</p>
                <p className="text-2xl font-bold text-foreground">{mockLmsData.totalCourses}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estudantes Ativos</p>
                <p className="text-2xl font-bold text-foreground">{mockLmsData.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tempo Médio (min)</p>
                <p className="text-2xl font-bold text-foreground">{mockLmsData.averageCompletionTime}</p>
              </div>
              <Clock className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-foreground">{mockLmsData.completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder para funcionalidades futuras */}
      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <BookOpen className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800 dark:text-blue-200">Sistema LMS em Desenvolvimento</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          As funcionalidades completas de analytics do LMS serão implementadas nas próximas versões. 
          Os dados mostrados são exemplos do que estará disponível.
        </AlertDescription>
      </Alert>

      {/* Cards informativos sobre funcionalidades futuras */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Analytics de Progresso</CardTitle>
            <CardDescription>
              Acompanhamento detalhado do progresso dos estudantes por curso e módulo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-muted-foreground">Gráfico de progresso será implementado aqui</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Avaliações e Feedback</CardTitle>
            <CardDescription>
              Análise de avaliações dos cursos e feedback dos estudantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-muted-foreground">Gráfico de avaliações será implementado aqui</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
