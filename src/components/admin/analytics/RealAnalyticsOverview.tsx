
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Users, 
  FileText, 
  GraduationCap, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

interface RealAnalyticsOverviewProps {
  data: any;
  loading: boolean;
  error: string | null;
}

export const RealAnalyticsOverview = ({ data, loading, error }: RealAnalyticsOverviewProps) => {
  // Memoized calculations for performance
  const calculatedData = useMemo(() => {
    if (!data) return null;

    const activeUsersGrowth = data.usersByTime?.length > 1 
      ? ((data.usersByTime[data.usersByTime.length - 1]?.usuarios || 0) - 
         (data.usersByTime[data.usersByTime.length - 2]?.usuarios || 0)) / 
         (data.usersByTime[data.usersByTime.length - 2]?.usuarios || 1) * 100
      : 0;

    const totalImplementations = data.implementationsByCategory?.reduce((sum: number, cat: any) => sum + cat.value, 0) || 0;
    const completedRate = data.userCompletionRate?.find((item: any) => item.name === 'Concluídas')?.value || 0;

    return {
      activeUsersGrowth: Math.round(activeUsersGrowth),
      totalImplementations,
      completedRate
    };
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
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

  if (!data) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Sem dados disponíveis</AlertTitle>
        <AlertDescription>Não há dados de analytics para exibir no momento.</AlertDescription>
      </Alert>
    );
  }

  // Metric cards data
  const metricCards = [
    {
      title: "Total de Usuários",
      value: data.totalUsers?.toLocaleString() || '0',
      icon: Users,
      trend: calculatedData?.activeUsersGrowth || 0,
      description: "usuários registrados"
    },
    {
      title: "Soluções Ativas",
      value: data.totalSolutions?.toLocaleString() || '0',
      icon: FileText,
      trend: 12,
      description: "soluções publicadas"
    },
    {
      title: "Cursos Disponíveis",
      value: data.totalCourses?.toLocaleString() || '0',
      icon: GraduationCap,
      trend: 8,
      description: "cursos ativos"
    },
    {
      title: "Implementações",
      value: calculatedData?.totalImplementations?.toLocaleString() || '0',
      icon: Activity,
      trend: calculatedData?.completedRate > 50 ? 15 : -5,
      description: "total de implementações"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => {
          const IconComponent = metric.icon;
          const isPositiveTrend = metric.trend >= 0;
          
          return (
            <Card key={index} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-neutral-300">
                  {metric.title}
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-[#0ABAB5]/10 flex items-center justify-center">
                  <IconComponent className="h-4 w-4 text-[#0ABAB5]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-neutral-100 mb-1">
                  {metric.value}
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center text-sm ${
                    isPositiveTrend ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isPositiveTrend ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {isPositiveTrend ? '+' : ''}{metric.trend}%
                  </div>
                  <span className="text-xs text-neutral-400">
                    {metric.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-neutral-100">Crescimento de Usuários</CardTitle>
            <CardDescription className="text-neutral-400">
              Evolução do número de usuários ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.usersByTime || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="usuarios"
                    stroke="#0ABAB5"
                    fill="#0ABAB5"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Solutions Popularity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-neutral-100">Soluções Populares</CardTitle>
            <CardDescription className="text-neutral-400">
              Ranking das soluções mais utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.solutionPopularity || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#0ABAB5"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Implementations by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-neutral-100">Por Categoria</CardTitle>
            <CardDescription className="text-neutral-400">
              Distribuição das implementações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.implementationsByCategory || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {(data.implementationsByCategory || []).map((entry: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 ? '#0ABAB5' : `hsl(${index * 60}, 70%, 50%)`}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-neutral-100">Taxa de Conclusão</CardTitle>
            <CardDescription className="text-neutral-400">
              Status das implementações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.userCompletionRate || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {(data.userCompletionRate || []).map((entry: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.name === 'Concluídas' ? '#10B981' : '#F59E0B'}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-neutral-100">Atividade Semanal</CardTitle>
            <CardDescription className="text-neutral-400">
              Atividade por dia da semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dayOfWeekActivity || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#9CA3AF"
                    fontSize={10}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={10}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Bar 
                    dataKey="atividade" 
                    fill="#0ABAB5"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
