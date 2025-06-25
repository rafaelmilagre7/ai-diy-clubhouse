
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, CheckCircle, TrendingUp } from 'lucide-react';

interface LmsStatCardsProps {
  totalCourses: number;
  totalStudents: number;
  avgNPS: number;
  totalResponses: number;
}

export const LmsStatCards: React.FC<LmsStatCardsProps> = ({ 
  totalCourses, 
  totalStudents, 
  avgNPS, 
  totalResponses 
}) => {
  // Função para determinar a cor do texto baseado no score NPS
  const npsScoreColorClass = (score: number) => {
    if (score >= 50) return "text-green-500";
    if (score >= 0) return "text-amber-500";
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
          <CardTitle className="text-sm font-medium">Total de Cursos</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCourses}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Cursos disponíveis na plataforma
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStudents}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Alunos com algum progresso registrado
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Score NPS</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <span className={`text-2xl font-bold ${npsScoreColorClass(avgNPS)}`}>
              {avgNPS}
            </span>
            <span className={`ml-2 text-sm ${npsScoreColorClass(avgNPS)}`}>
              {getNpsStatus(avgNPS)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Net Promoter Score geral
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total de Respostas</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalResponses}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Avaliações coletadas
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
