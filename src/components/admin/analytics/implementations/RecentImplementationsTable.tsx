
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ImplementationData } from '@/hooks/analytics/implementations/useImplementationsAnalyticsData';

interface RecentImplementationsTableProps {
  data: ImplementationData['recentImplementations'];
  loading: boolean;
}

export const RecentImplementationsTable: React.FC<RecentImplementationsTableProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="animate-pulse h-6 w-3/4 bg-muted rounded mb-2"></CardTitle>
          <CardDescription className="animate-pulse h-4 w-1/2 bg-muted rounded"></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-chart-md w-full animate-pulse bg-muted/50 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Implementações Recentes</CardTitle>
        <CardDescription>
          Atividade recente nas implementações de soluções
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Solução</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Última atividade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.userName}</TableCell>
                    <TableCell>{item.solutionTitle}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${item.status === 'Concluído' ? 'bg-success/10 text-success' : 'bg-operational/10 text-operational'}`}>
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={item.percentComplete} className="h-2 w-20" />
                        <span className="text-xs">{item.percentComplete}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.lastActivity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-chart-sm">
            <p className="text-muted-foreground">Nenhuma implementação recente encontrada</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
