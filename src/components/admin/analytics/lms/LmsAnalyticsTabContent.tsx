
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Users, Clock, TrendingUp } from 'lucide-react';
import { useLmsAnalyticsData } from '@/hooks/analytics/useLmsAnalyticsData';
import { ModernLoadingState } from '../ModernLoadingState';

interface LmsAnalyticsTabContentProps {
  timeRange: string;
}

export const LmsAnalyticsTabContent = ({ timeRange }: LmsAnalyticsTabContentProps) => {
  const { data, loading, error } = useLmsAnalyticsData(timeRange);

  if (loading) {
    return <ModernLoadingState type="full" />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="border-red-800/50 bg-red-950/20 backdrop-blur-xl">
        <BookOpen className="h-4 w-4" />
        <AlertTitle className="text-red-400">Erro ao carregar dados do LMS</AlertTitle>
        <AlertDescription className="text-red-300">{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gray-800/50 bg-[#151823]/80 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total de Cursos</p>
                <p className="text-2xl font-bold text-white">{data.totalCourses}</p>
              </div>
              <BookOpen className="h-8 w-8 text-[#00EAD9]" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-800/50 bg-[#151823]/80 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Estudantes Ativos</p>
                <p className="text-2xl font-bold text-white">{data.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-800/50 bg-[#151823]/80 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Tempo Médio (min)</p>
                <p className="text-2xl font-bold text-white">{data.averageCompletionTime}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-800/50 bg-[#151823]/80 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-white">{data.completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e dados detalhados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-gray-800/50 bg-[#151823]/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Progresso por Curso</CardTitle>
            <CardDescription className="text-gray-400">
              Acompanhamento de conclusões por curso
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.courseProgress.length > 0 ? (
              <div className="space-y-4">
                {data.courseProgress.map((course, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{course.name}</span>
                      <span className="text-gray-400">
                        {course.completed}/{course.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-[#00EAD9] h-2 rounded-full transition-all"
                        style={{ 
                          width: course.total > 0 ? `${(course.completed / course.total) * 100}%` : '0%' 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-gray-500">
                <p>Nenhum progresso de curso disponível</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-gray-800/50 bg-[#151823]/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Scores NPS por Aula</CardTitle>
            <CardDescription className="text-gray-400">
              Avaliação de satisfação dos estudantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.npsScores.length > 0 ? (
              <div className="space-y-4">
                {data.npsScores.slice(0, 5).map((nps, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-[#0F111A]/50 rounded-lg">
                    <div>
                      <p className="text-white text-sm font-medium">{nps.lesson}</p>
                      <p className="text-gray-400 text-xs">{nps.responses} resposta{nps.responses !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${
                        nps.score >= 8 ? 'text-green-500' : 
                        nps.score >= 6 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {nps.score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-gray-500">
                <p>Nenhuma avaliação NPS disponível</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
