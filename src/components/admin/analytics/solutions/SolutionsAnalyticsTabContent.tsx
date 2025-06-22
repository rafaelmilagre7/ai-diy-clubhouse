
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { SolutionStatCards } from './SolutionStatCards';
import { CategoryDistributionChart } from './CategoryDistributionChart';
import { SolutionPopularityChart } from './SolutionPopularityChart';
import { CompletionRatesChart } from './CompletionRatesChart';
import { DifficultyDistributionChart } from './DifficultyDistributionChart';
import { useRealAnalyticsData } from '@/hooks/admin/analytics/useRealAnalyticsData';

export const SolutionsAnalyticsTabContent = () => {
  const { data, loading, refresh } = useRealAnalyticsData();

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Analytics de Soluções</h2>
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
          <Button disabled variant="outline">
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Atualizando
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(null).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics de Soluções</h2>
          <p className="text-muted-foreground">
            Análise detalhada do desempenho das soluções implementadas
          </p>
        </div>
        
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Cards de Estatísticas - SEM trends hardcoded */}
      <SolutionStatCards data={data} />

      {/* Charts baseados em dados reais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryDistributionChart data={data.categoryDistribution} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Soluções Mais Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <SolutionPopularityChart data={data.popularSolutions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taxa de Conclusão por Solução</CardTitle>
          </CardHeader>
          <CardContent>
            <CompletionRatesChart data={data.completionRates} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Dificuldade</CardTitle>
          </CardHeader>
          <CardContent>
            <DifficultyDistributionChart data={data.difficultyDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* Mostrar aviso se não há dados suficientes */}
      {(!data.categoryDistribution.length && !data.popularSolutions.length) && (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Dados insuficientes</h3>
            <p className="text-muted-foreground">
              Ainda não há dados suficientes de soluções implementadas para gerar analytics detalhados.
              Os dados aparecerão conforme os usuários interagirem com as soluções.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
