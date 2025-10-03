import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CourseStats } from '@/hooks/analytics/lms/useRealLmsAnalytics';
import { ArrowUpIcon, ArrowDownIcon, TrendingUp } from 'lucide-react';

interface CoursePerformanceTableProps {
  data: CourseStats[];
  isLoading?: boolean;
}

export const CoursePerformanceTable = ({ data, isLoading }: CoursePerformanceTableProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Detalhada por Curso</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getCompletionBadge = (rate: number) => {
    if (rate >= 75) return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Excelente</Badge>;
    if (rate >= 50) return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">Boa</Badge>;
    if (rate >= 25) return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Regular</Badge>;
    return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Baixa</Badge>;
  };

  const getProgressIcon = (progress: number) => {
    if (progress >= 70) return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
    if (progress >= 40) return <TrendingUp className="h-4 w-4 text-blue-500" />;
    return <ArrowDownIcon className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Detalhada por Curso</CardTitle>
        <CardDescription>
          Métricas completas de engajamento e conclusão de cada curso
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Curso</TableHead>
                <TableHead className="text-center">Aulas</TableHead>
                <TableHead className="text-center">Iniciaram</TableHead>
                <TableHead className="text-center">Concluíram</TableHead>
                <TableHead className="text-center">Taxa Conclusão</TableHead>
                <TableHead className="text-center">Progresso Médio</TableHead>
                <TableHead className="text-center">Ativos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhum dado de curso disponível
                  </TableCell>
                </TableRow>
              ) : (
                data.map((course) => (
                  <TableRow key={course.courseId} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold text-sm">{course.courseName}</div>
                        <div className="text-xs text-muted-foreground">
                          {course.totalModules} módulos
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium">{course.totalLessons}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium text-blue-600">{course.usersStarted}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium text-green-600">{course.usersCompleted}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {getCompletionBadge(course.completionRate)}
                        <span className="text-sm font-semibold">{course.completionRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {getProgressIcon(course.averageProgress)}
                        <span className="font-semibold">{course.averageProgress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium text-purple-600">{course.activeEnrollments}</span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {data.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            <p>• <strong>Iniciaram:</strong> Usuários que completaram pelo menos 1 aula</p>
            <p>• <strong>Concluíram:</strong> Usuários que completaram todas as aulas do curso</p>
            <p>• <strong>Ativos:</strong> Usuários com atividade recente no período selecionado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
