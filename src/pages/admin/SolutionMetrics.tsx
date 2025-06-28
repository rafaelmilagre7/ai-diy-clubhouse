
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Target } from 'lucide-react';

const SolutionMetrics = () => {
  // Mock data since solution_metrics table doesn't exist
  const mockSolutions = [
    {
      id: '1',
      title: 'Automação de Marketing com IA',
      category: 'Receita',
      views: 245,
      implementations: 32,
      completion_rate: 78
    },
    {
      id: '2',
      title: 'Otimização de Processos',
      category: 'Operacional',
      views: 189,
      implementations: 28,
      completion_rate: 65
    }
  ];

  const totalViews = mockSolutions.reduce((sum, sol) => sum + sol.views, 0);
  const totalImplementations = mockSolutions.reduce((sum, sol) => sum + sol.implementations, 0);
  const avgCompletionRate = mockSolutions.reduce((sum, sol) => sum + sol.completion_rate, 0) / mockSolutions.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Métricas de Soluções</h1>
          <p className="text-muted-foreground">
            Acompanhe o desempenho das soluções implementadas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">
              +15.2% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Implementações</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImplementations}</div>
            <p className="text-xs text-muted-foreground">
              Soluções implementadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgCompletionRate)}%</div>
            <p className="text-xs text-muted-foreground">
              Taxa média de conclusão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversão</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((totalImplementations / totalViews) * 100)}%</div>
            <p className="text-xs text-muted-foreground">
              Visualização para implementação
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance por Solução</CardTitle>
          <CardDescription>
            Métricas detalhadas de cada solução
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockSolutions.map((solution, index) => (
              <div key={solution.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                    <span className="text-sm font-bold">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">{solution.title}</h4>
                    <p className="text-sm text-muted-foreground">{solution.category}</p>
                  </div>
                </div>
                <div className="flex space-x-8 text-right">
                  <div>
                    <div className="text-lg font-bold">{solution.views}</div>
                    <div className="text-sm text-muted-foreground">visualizações</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{solution.implementations}</div>
                    <div className="text-sm text-muted-foreground">implementações</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{solution.completion_rate}%</div>
                    <div className="text-sm text-muted-foreground">conclusão</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SolutionMetrics;
