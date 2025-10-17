
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FeedbackData {
  id: string;
  lessonId: string;
  lessonTitle: string;
  score: number;
  feedback: string | null;
  createdAt: string;
  userName: string;
}

interface LessonFeedbackTableProps {
  feedbackData: FeedbackData[];
  isLoading: boolean;
}

export const LessonFeedbackTable: React.FC<LessonFeedbackTableProps> = ({ feedbackData, isLoading }) => {
  const getNpsScoreColor = (score: number) => {
    if (score >= 9) return "bg-success/10 text-success dark:bg-success/20 dark:text-success";
    if (score >= 7) return "bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning";
    return "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive";
  };

  // Gerar dados simulados se necessário
  const displayData = feedbackData.length > 0 ? feedbackData : [];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedbacks dos Alunos</CardTitle>
        <CardDescription>
          Avaliações e comentários recentes sobre as aulas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-5 w-1/4" />
                </div>
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-auto max-h-chart-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aula</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead className="text-right">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.length > 0 ? (
                  displayData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium max-w-table-sm truncate">
                        {item.lessonTitle}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getNpsScoreColor(item.score)}>
                          {item.score}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.userName}</TableCell>
                      <TableCell className="max-w-table-md">
                        {item.feedback ? (
                          <div className="max-h-24 overflow-y-auto">
                            {item.feedback}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Sem comentários</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {format(new Date(item.createdAt), "dd/MM/yy HH:mm", { locale: ptBR })}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      <p className="mb-2">Nenhum feedback encontrado para o período selecionado.</p>
                      <p className="text-sm">Os feedbacks são coletados através do formulário de NPS ao final de cada aula</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
