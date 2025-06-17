
import React from 'react';
import { UserGrowthChart } from './UserGrowthChart';
import { PopularSolutionsChart } from './PopularSolutionsChart';
import { ImplementationsByCategoryChart } from './ImplementationsByCategoryChart';
import { CompletionRateChart } from './CompletionRateChart';
import { WeeklyActivityChart } from './WeeklyActivityChart';
import { ModernStatsCard } from './ModernStatsCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Users, TrendingUp, Activity, CheckCircle, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OverviewTabContentProps {
  timeRange: string;
  loading?: boolean;
  data?: {
    usersByTime: any[];
    solutionPopularity: any[];
    implementationsByCategory: any[];
    userCompletionRate: any[];
    dayOfWeekActivity: any[];
  };
  onRefresh?: () => void;
}

export const OverviewTabContent = ({ 
  timeRange, 
  loading = true, 
  data = {
    usersByTime: [],
    solutionPopularity: [],
    implementationsByCategory: [],
    userCompletionRate: [],
    dayOfWeekActivity: []
  },
  onRefresh
}: OverviewTabContentProps) => {
  const renderSkeleton = () => (
    <div className="space-y-8">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, i) => (
          <ModernStatsCard
            key={i}
            title=""
            value=""
            icon={Users}
            loading={true}
          />
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
          <CardHeader className="pb-4">
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
          <CardHeader className="pb-4">
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const hasData = !loading && (
    data?.usersByTime.length > 0 || 
    data?.solutionPopularity.length > 0 || 
    data?.implementationsByCategory.length > 0 || 
    data?.userCompletionRate.length > 0 || 
    data?.dayOfWeekActivity.length > 0
  );

  if (loading) {
    return renderSkeleton();
  }

  if (!hasData) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="h-12 w-12 text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Sem dados disponíveis
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Não foram encontrados dados de análise para o período selecionado. 
            Tente selecionar um período diferente ou verificar se existem registros no sistema.
          </p>
          {onRefresh && (
            <Button 
              onClick={onRefresh}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar dados
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Calculate stats for the modern cards
  const totalUsers = data.usersByTime.reduce((sum, item) => sum + (item.novos || 0), 0);
  const totalSolutions = data.solutionPopularity.length;
  const completedImplementations = data.userCompletionRate.find(item => item.name === 'Concluídas')?.value || 0;
  const avgEngagement = data.dayOfWeekActivity.reduce((sum, item) => sum + (item.atividade || 0), 0) / data.dayOfWeekActivity.length;

  return (
    <div className="space-y-8">
      {/* Modern Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModernStatsCard
          title="Total de Usuários"
          value={totalUsers.toLocaleString()}
          icon={Users}
          trend={{
            value: 12.5,
            label: "vs mês anterior", 
            type: "positive"
          }}
          colorScheme="blue"
        />
        
        <ModernStatsCard
          title="Soluções Ativas"
          value={totalSolutions}
          icon={Star}
          trend={{
            value: 8.2,
            label: "vs mês anterior",
            type: "positive"
          }}
          colorScheme="purple"
        />
        
        <ModernStatsCard
          title="Implementações Concluídas"
          value={completedImplementations}
          icon={CheckCircle}
          trend={{
            value: 15.3,
            label: "vs mês anterior",
            type: "positive"
          }}
          colorScheme="green"
        />
        
        <ModernStatsCard
          title="Engajamento Médio"
          value={`${Math.round(avgEngagement)}%`}
          icon={Activity}
          trend={{
            value: 5.1,
            label: "vs mês anterior",
            type: "positive"
          }}
          colorScheme="orange"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Crescimento de Usuários
            </CardTitle>
            <CardDescription>
              Evolução do número de usuários ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserGrowthChart data={data.usersByTime} />
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Soluções Populares
            </CardTitle>
            <CardDescription>
              Ranking das soluções mais utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PopularSolutionsChart data={data.solutionPopularity} />
          </CardContent>
        </Card>
      </div>
      
      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Por Categoria
            </CardTitle>
            <CardDescription>
              Distribuição por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImplementationsByCategoryChart data={data.implementationsByCategory} />
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Taxa de Conclusão
            </CardTitle>
            <CardDescription>
              Status das implementações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CompletionRateChart data={data.userCompletionRate} />
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Atividade Semanal
            </CardTitle>
            <CardDescription>
              Padrão de uso por dia da semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyActivityChart data={data.dayOfWeekActivity} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
