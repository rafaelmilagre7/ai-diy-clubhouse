
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AreaChart, BarChart, PieChart } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  TrendingUp, 
  Clock, 
  Target,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { 
  processUserGrowthData,
  processSolutionPerformance,
  processLearningAnalytics,
  processWeeklyActivity,
  processRoleDistribution,
  formatDuration,
  formatPercentage,
  getEngagementLevel,
  getEngagementColor
} from './RealAnalyticsUtils';

interface RealAnalyticsOverviewProps {
  data: any;
  loading: boolean;
  error?: string | null;
}

export const RealAnalyticsOverview = ({ data, loading, error }: RealAnalyticsOverviewProps) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton para cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Skeleton para gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar dados</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const userGrowthData = processUserGrowthData(data.userGrowthData);
  const solutionPerformanceData = processSolutionPerformance(data.solutionPerformance);
  const learningData = processLearningAnalytics(data.learningProgress);
  const weeklyData = processWeeklyActivity(data.weeklyActivity);
  const roleData = processRoleDistribution(data.userRoleDistribution);

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{data.newUsers30d} nos últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Implementações</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.completedImplementations}</div>
            <p className="text-xs text-muted-foreground">
              {data.activeImplementations} em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(data.overallCompletionRate)}</div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                style={{ color: getEngagementColor(data.overallCompletionRate) }}
              >
                {getEngagementLevel(data.overallCompletionRate)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(data.avgImplementationTimeMinutes)}</div>
            <p className="text-xs text-muted-foreground">
              Por implementação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeUsers7d}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 7 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprendizado</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.completedLessons}</div>
            <p className="text-xs text-muted-foreground">
              Aulas concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalBenefitClicks}</div>
            <p className="text-xs text-muted-foreground">
              Cliques em benefícios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fórum</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.forumTopics}</div>
            <p className="text-xs text-muted-foreground">
              Tópicos criados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crescimento de usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Usuários</CardTitle>
            <CardDescription>
              Novos usuários registrados ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userGrowthData.length > 0 ? (
              <AreaChart 
                data={userGrowthData}
                categories={['novos', 'total']}
                index="name"
                colors={['#3B82F6', '#0ABAB5']}
                valueFormatter={(value) => `${value} usuário${value !== 1 ? 's' : ''}`}
                className="h-80"
              />
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                Dados insuficientes para exibição
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance de soluções */}
        <Card>
          <CardHeader>
            <CardTitle>Soluções Mais Populares</CardTitle>
            <CardDescription>
              Top 5 soluções com mais implementações
            </CardDescription>
          </CardHeader>
          <CardContent>
            {solutionPerformanceData.length > 0 ? (
              <BarChart 
                data={solutionPerformanceData}
                categories={['value']}
                index="name"
                colors={['#F59E0B']}
                valueFormatter={(value) => `${value} implementações`}
                className="h-80"
              />
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                Dados insuficientes para exibição
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos secundários */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Atividade semanal */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Semanal</CardTitle>
            <CardDescription>
              Atividade por dia da semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={weeklyData}
              categories={['atividade']}
              index="day"
              colors={['#0ABAB5']}
              valueFormatter={(value) => `${value} atividades`}
              className="h-64"
            />
          </CardContent>
        </Card>

        {/* Distribuição por roles */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Usuários</CardTitle>
            <CardDescription>
              Por tipo de usuário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PieChart 
              data={roleData}
              category="value"
              index="name"
              valueFormatter={(value) => `${value} usuários`}
              colors={['#10B981', '#3B82F6', '#F59E0B', '#EF4444']}
              className="h-64"
            />
          </CardContent>
        </Card>

        {/* Progresso de aprendizado */}
        <Card>
          <CardHeader>
            <CardTitle>Progresso de Cursos</CardTitle>
            <CardDescription>
              Usuários matriculados por curso
            </CardDescription>
          </CardHeader>
          <CardContent>
            {learningData.length > 0 ? (
              <BarChart 
                data={learningData}
                categories={['value']}
                index="name"
                colors={['#8B5CF6']}
                valueFormatter={(value) => `${value} usuários`}
                className="h-64"
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Nenhum curso com dados disponíveis
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
