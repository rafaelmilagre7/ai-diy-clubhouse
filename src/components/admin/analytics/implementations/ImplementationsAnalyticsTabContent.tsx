
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ImplementationsStatCards } from './ImplementationsStatCards';
import { DifficultyDistributionChart } from './DifficultyDistributionChart';
import { CompletionTimeChart } from './CompletionTimeChart';
import { AbandonmentRateChart } from './AbandonmentRateChart';
import { RecentImplementationsTable } from './RecentImplementationsTable';
import { useImplementationsAnalyticsData } from '@/hooks/analytics/implementations/useImplementationsAnalyticsData';

interface ImplementationsAnalyticsTabContentProps {
  timeRange: string;
}

export const ImplementationsAnalyticsTabContent = ({ timeRange }: ImplementationsAnalyticsTabContentProps) => {
  const { data, isLoading, error, refetch } = useImplementationsAnalyticsData(timeRange);

  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics de Implementações</h2>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
        <Button disabled variant="outline">
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          Atualizando
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-[150px] mb-2" />
              <Skeleton className="h-8 w-[80px]" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-[200px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return renderSkeleton();
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Analytics de Implementações</h2>
            <p className="text-muted-foreground">Erro ao carregar dados</p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
        
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar dados</AlertTitle>
          <AlertDescription>
            Ocorreu um erro ao carregar os dados de analytics de implementações. 
            Tente atualizar a página ou entre em contato com o suporte.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Verificar se há dados suficientes
  const hasData = data && (
    data.completionRate.completed > 0 || 
    data.completionRate.inProgress > 0 ||
    data.implementationsByDifficulty.length > 0 ||
    data.recentImplementations.length > 0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics de Implementações</h2>
          <p className="text-muted-foreground">
            Análise detalhada do progresso e desempenho das implementações
          </p>
        </div>
        
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <ImplementationsStatCards data={data} />

      {hasData ? (
        <>
          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Dificuldade</CardTitle>
              </CardHeader>
              <CardContent>
                <DifficultyDistributionChart 
                  data={data.implementationsByDifficulty} 
                  loading={isLoading}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio de Conclusão</CardTitle>
              </CardHeader>
              <CardContent>
                <CompletionTimeChart 
                  data={data.averageCompletionTime} 
                  loading={isLoading}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taxa de Abandono por Módulo</CardTitle>
              </CardHeader>
              <CardContent>
                <AbandonmentRateChart 
                  data={data.abandonmentByModule} 
                  loading={isLoading}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Implementações Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentImplementationsTable 
                  data={data.recentImplementations} 
                  loading={isLoading}
                />
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Dados insuficientes</h3>
            <p className="text-muted-foreground">
              Ainda não há dados suficientes de implementações para gerar analytics detalhados.
              Os dados aparecerão conforme os usuários iniciarem e concluírem implementações.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
