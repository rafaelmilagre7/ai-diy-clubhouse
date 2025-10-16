import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { DataStatusIndicator } from '../DataStatusIndicator';
import { useAnalyticsData } from "@/hooks/analytics/useAnalyticsData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Clock, 
  Award,
  Activity,
  UserCheck,
  UserPlus,
  Star,
  Zap,
  Eye
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
interface EnhancedUserAnalyticsProps {
  timeRange: string;
}

export const EnhancedUserAnalytics = ({ timeRange }: EnhancedUserAnalyticsProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, loading, error } = useAnalyticsData({ timeRange });

  // Calcular métricas principais baseadas nos dados reais
  const metrics = [
    {
      title: "Usuários Ativos Diários",
      value: data?.usersByTime?.length || 0,
      icon: Users,
      description: "Média dos últimos dias",
      color: "text-operational",
      trend: null
    },
    {
      title: "Usuários Ativos Semanais", 
      value: data?.usersByTime?.filter(u => u.novos > 0)?.length || 0,
      icon: UserCheck,
      description: "Últimos 7 dias",
      color: "text-success",
      trend: null
    },
    {
      title: "Taxa de Engajamento",
      value: `${Math.round((data?.dayOfWeekActivity?.reduce((acc, d) => acc + d.atividade, 0) || 0) / (data?.dayOfWeekActivity?.length || 1))}%`,
      icon: Activity,
      description: "Sessões de um evento",
      color: "text-strategy", 
      trend: null
    },
    {
      title: "Implementações Ativas",
      value: data?.userCompletionRate?.reduce((acc, item) => acc + item.value, 0) || 0,
      icon: Award,
      description: "Por usuário ativo",
      color: "text-revenue",
      trend: null
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header com KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold">{metric.value}</div>
                <DataStatusIndicator isDataReal={!loading && !error} loading={loading} error={error} />
              </div>
              <div className="flex items-center mt-1">
                <span className="text-xs text-muted-foreground">
                  {metric.description}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráfico de Crescimento de Usuários */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Crescimento de Usuários</CardTitle>
            <CardDescription>
              Evolução do número de usuários ao longo do tempo
            </CardDescription>
          </div>
          <DataStatusIndicator isDataReal={!loading && !error} loading={loading} error={error} />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : data?.usersByTime && data.usersByTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.usersByTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="usuarios" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="total" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Dados de crescimento não disponíveis para o período selecionado
            </div>
          )}
        </CardContent>
      </Card>

      {/* Funil de Conversão */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Funil de Conversão</CardTitle>
            <CardDescription>
              Jornada do usuário desde o cadastro até a implementação
            </CardDescription>
          </div>
          <DataStatusIndicator isDataReal={!loading && !error} loading={loading} error={error} />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : data?.implementationsByCategory ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.implementationsByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Dados do funil não disponíveis para o período selecionado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Componente para KPI Cards
interface UserKPICardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  loading?: boolean;
}

const UserKPICard = ({ title, value, change, icon, color, loading }: UserKPICardProps) => {
  const colorClasses = {
    blue: 'text-operational bg-operational/10',
    green: 'text-success bg-success/10',
    purple: 'text-strategy bg-strategy/10',
    orange: 'text-revenue bg-revenue/10'
  };

  const isPositive = change >= 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
          <div className="flex items-center space-x-1">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
            <span className={`text-sm font-medium ${
              isPositive ? 'text-success' : 'text-destructive'
            }`}>
              {Math.abs(change)}%
            </span>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {loading ? (
            <div className="h-8 bg-gray-200 animate-pulse rounded mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Componentes placeholder para as outras seções
const UserSegmentBreakdown = ({ data, loading }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Análise Detalhada por Segmento</CardTitle>
      <CardDescription>Breakdown completo dos segmentos de usuários</CardDescription>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {data?.map((segment: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Badge variant="outline">{segment.name}</Badge>
                <span className="text-sm text-gray-600">{segment.description}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-lg font-semibold">{segment.count}</span>
                <Progress value={segment.percentage} className="w-20" />
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

const UserRoleAnalysis = ({ data, loading }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Análise por Papel de Usuário</CardTitle>
      <CardDescription>Distribuição e performance por role</CardDescription>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data?.roles?.map((role: any, index: number) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{role.name}</h4>
                <Badge>{role.count}</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Onboarding Completo</span>
                  <span>{role.completionRate}%</span>
                </div>
                <Progress value={role.completionRate} />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Engajamento</span>
                  <span>{role.engagementScore}/100</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

const UserEngagementMetrics = ({ data, loading }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Métricas de Engajamento</CardTitle>
      <CardDescription>Análise comportamental dos usuários</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center p-4 border rounded-lg">
          <Zap className="h-8 w-8 mx-auto mb-2 text-warning" />
          <div className="text-2xl font-bold">{data?.avgSessionTime || '25m'}</div>
          <div className="text-sm text-muted-foreground">Tempo médio por sessão</div>
        </div>
        
        <div className="text-center p-4 border rounded-lg">
          <Eye className="h-8 w-8 mx-auto mb-2 text-operational" />
          <div className="text-2xl font-bold">{data?.pageViewsPerSession || '4.2'}</div>
          <div className="text-sm text-muted-foreground">Pages por sessão</div>
        </div>
        
        <div className="text-center p-4 border rounded-lg">
          <Award className="h-8 w-8 mx-auto mb-2 text-success" />
          <div className="text-2xl font-bold">{data?.featureAdoption || '78%'}</div>
          <div className="text-sm text-muted-foreground">Adoção de features</div>
        </div>
        
        <div className="text-center p-4 border rounded-lg">
          <Activity className="h-8 w-8 mx-auto mb-2 text-strategy" />
          <div className="text-2xl font-bold">{data?.dailyActiveUsers || '156'}</div>
          <div className="text-sm text-muted-foreground">DAU médio</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const UserJourneyAnalysis = ({ data, loading }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Análise da Jornada do Usuário</CardTitle>
      <CardDescription>Padrões de navegação e pontos de fricção</CardDescription>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="h-64 bg-gray-200 animate-pulse rounded" />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Pontos de Abandono Principais</h4>
            <Badge variant="outline">Últimos 30 dias</Badge>
          </div>
          
          {data?.dropoffPoints?.map((point: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">{point.page}</div>
                <div className="text-sm text-gray-600">{point.description}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-destructive">{point.dropoffRate}%</div>
                <div className="text-sm text-muted-foreground">{point.users} usuários</div>
              </div>
            </div>
          )) || (
            <div className="text-center py-8 text-gray-500">
              Carregando dados da jornada...
            </div>
          )}
        </div>
      )}
    </CardContent>
  </Card>
);

const UserGrowthTrendCard = ({ data, loading }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Tendência de Crescimento</CardTitle>
      <CardDescription>Projeções baseadas nos dados atuais</CardDescription>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="h-40 bg-gray-200 animate-pulse rounded" />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Projeção 30 dias</span>
            <span className="font-semibold text-success">+{data?.projectedGrowth || 45} usuários</span>
          </div>
          
          <Progress value={data?.growthProgress || 68} className="h-2" />
          
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="text-center">
              <div className="text-lg font-bold text-operational">{data?.organicGrowth || '82%'}</div>
              <div className="text-xs text-muted-foreground">Crescimento Orgânico</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-strategy">{data?.referralGrowth || '18%'}</div>
              <div className="text-xs text-muted-foreground">Via Indicações</div>
            </div>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);