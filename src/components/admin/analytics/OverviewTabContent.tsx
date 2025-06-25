import React from 'react';
import { useOverviewData } from '@/hooks/analytics/useOverviewData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Target, BarChart3 } from 'lucide-react';
import LoadingScreen from '@/components/common/LoadingScreen';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface OverviewTabContentProps {
  timeRange: string;
}

export const OverviewTabContent = ({ timeRange }: OverviewTabContentProps) => {
  const { data, loading, error } = useOverviewData({ timeRange });

  if (loading) {
    return <LoadingScreen variant="modern" type="full" fullScreen={false} />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="border-0 shadow-xl bg-red-50/80 backdrop-blur-sm">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar dados</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const growthRate = data.totalUsersChange > 0 ? data.totalUsersChange : 0;

  return (
    <div className="space-y-8">
      {/* Stats modernas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeUsers}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
              <span>{data.activeUsersChange}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
              <span>{growthRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Taxa de Engajamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.engagementRate}%</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
              <span>{data.engagementRateChange}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Novas Implementações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.newImplementations}</div>
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
              <span>{data.newImplementationsChange}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Crescimento de Usuários
            </CardTitle>
            <p className="text-sm text-gray-600">
              Total de usuários ao longo do tempo
            </p>
          </CardHeader>
          <CardContent>
            {/* Placeholder para o gráfico de crescimento de usuários */}
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Gráfico de Crescimento de Usuários
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Implementações por Categoria
            </CardTitle>
            <p className="text-sm text-gray-600">
              Distribuição de implementações por categoria
            </p>
          </CardHeader>
          <CardContent>
            {/* Placeholder para o gráfico de implementações por categoria */}
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Gráfico de Implementações por Categoria
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas chave */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Taxa de Conclusão de Metas
            </CardTitle>
            <p className="text-sm text-gray-600">
              Percentual de metas concluídas
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.completionRate}%</div>
            <div className="text-sm text-muted-foreground">
              Aumento de {data.completionRateChange}% em relação ao período
              anterior
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Usuários Recorrentes
            </CardTitle>
            <p className="text-sm text-gray-600">
              Usuários que retornam à plataforma
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.recurringUsers}</div>
            <div className="text-sm text-muted-foreground">
              Aumento de {data.recurringUsersChange}% em relação ao período
              anterior
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Média de Implementações por Usuário
            </CardTitle>
            <p className="text-sm text-gray-600">
              Número médio de implementações por usuário
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.avgImplementations}</div>
            <div className="text-sm text-muted-foreground">
              Aumento de {data.avgImplementationsChange}% em relação ao período
              anterior
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
