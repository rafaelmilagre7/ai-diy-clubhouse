
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Users, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { useLmsAnalyticsData } from '@/hooks/analytics/lms/useLmsAnalyticsData';
import { ModernLoadingState } from '../ModernLoadingState';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface LmsAnalyticsTabContentProps {
  timeRange: string;
}

export const LmsAnalyticsTabContent = ({ timeRange }: LmsAnalyticsTabContentProps) => {
  const { 
    totalCourses, 
    totalStudents, 
    averageCompletionTime, 
    completionRate, 
    courseProgress, 
    npsScores, 
    isLoading, 
    refresh 
  } = useLmsAnalyticsData(timeRange);

  if (isLoading) {
    return <ModernLoadingState type="full" />;
  }

  // Verificar se há dados suficientes
  const hasData = totalStudents > 0 || totalCourses > 0 || npsScores.length > 0;

  return (
    <div className="space-y-6">
      {/* Header com botão de refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics do LMS</h2>
          <p className="text-gray-400">
            Análise de desempenho do sistema de aprendizado
          </p>
        </div>
        
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gray-800/50 bg-[#151823]/80 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total de Aulas</p>
                <p className="text-2xl font-bold text-white">{totalCourses}</p>
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
                <p className="text-2xl font-bold text-white">{totalStudents}</p>
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
                <p className="text-2xl font-bold text-white">{averageCompletionTime}</p>
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
                <p className="text-2xl font-bold text-white">{completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de dados detalhados ou empty state */}
      {hasData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-gray-800/50 bg-[#151823]/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Progresso por Curso</CardTitle>
              <CardDescription className="text-gray-400">
                Acompanhamento de conclusões por curso
              </CardDescription>
            </CardHeader>
            <CardContent>
              {courseProgress.length > 0 ? (
                <div className="space-y-4">
                  {courseProgress.map((course, index) => (
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
                  <div className="text-center">
                    <BookOpen className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p>Nenhum progresso de curso disponível</p>
                  </div>
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
              {npsScores.length > 0 ? (
                <div className="space-y-4">
                  {npsScores.map((nps, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-[#0F111A]/50 rounded-lg">
                      <div>
                        <p className="text-white text-sm font-medium">{nps.lesson}</p>
                        <p className="text-gray-400 text-xs">{nps.responses} resposta{nps.responses !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-bold ${
                          nps.score >= 50 ? 'text-green-500' : 
                          nps.score >= 0 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {nps.score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-500">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p>Nenhuma avaliação NPS disponível</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        // Empty state quando não há dados
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-white">Dados insuficientes</h3>
            <p className="text-muted-foreground max-w-md">
              Ainda não há dados suficientes no LMS para gerar analytics detalhados.
              Os dados aparecerão conforme os usuários interagirem com as aulas e cursos.
            </p>
            <div className="mt-6 text-sm text-gray-400">
              <p>• Crie aulas e publique cursos</p>
              <p>• Usuários precisam assistir aulas</p>
              <p>• Avaliações NPS precisam ser enviadas</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
