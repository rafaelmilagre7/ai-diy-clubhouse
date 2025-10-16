
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, CheckCircle, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LmsStatsProps {
  stats: {
    totalStudents: number;
    totalLessons: number;
    completionRate: number;
    npsScore: number;
  };
  isLoading: boolean;
}

export const LmsStatCards: React.FC<LmsStatsProps> = ({ stats, isLoading }) => {
  // Função para determinar a cor do texto baseado no score NPS
  const npsScoreColorClass = (score: number) => {
    if (score >= 50) return "text-green-500";
    if (score >= 0) return "text-warning";
    return "text-red-500";
  };

  // Status baseado no NPS
  const getNpsStatus = (score: number) => {
    if (score >= 50) return "Excelente";
    if (score >= 30) return "Bom";
    if (score >= 0) return "Aceitável";
    if (score >= -20) return "Precisa de atenção";
    return "Crítico";
  };

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          )}
          {!isLoading && (
            <p className="text-xs text-muted-foreground mt-1">
              Alunos com algum progresso registrado
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total de Aulas</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <div className="text-2xl font-bold">{stats.totalLessons}</div>
          )}
          {!isLoading && (
            <p className="text-xs text-muted-foreground mt-1">
              Aulas publicadas e disponíveis
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
          )}
          {!isLoading && (
            <p className="text-xs text-muted-foreground mt-1">
              Taxa média de conclusão das aulas
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Score NPS</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <div className="flex items-center">
              <span className={`text-2xl font-bold ${npsScoreColorClass(stats.npsScore)}`}>
                {stats.npsScore}
              </span>
              <span className={`ml-2 text-sm ${npsScoreColorClass(stats.npsScore)}`}>
                {getNpsStatus(stats.npsScore)}
              </span>
            </div>
          )}
          {!isLoading && (
            <p className="text-xs text-muted-foreground mt-1">
              Net Promoter Score geral
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
