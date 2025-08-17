import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, UserCheck, UserPlus, Activity, Clock, Target,
  TrendingUp, TrendingDown, AlertTriangle, Search,
  Filter, Download, UserX, Zap, Award, Eye
} from 'lucide-react';
import { useEnhancedUserAnalytics } from '@/hooks/analytics/useEnhancedUserAnalytics';
import { UserSegmentChart } from './charts/UserSegmentChart';
import { UserFunnelChart } from './charts/UserFunnelChart';
import { UserActivityHeatmap } from './charts/UserActivityHeatmap';
import { UserRetentionChart } from './charts/UserRetentionChart';
import { UserDetailsTable } from './UserDetailsTable';

interface EnhancedUserAnalyticsProps {
  timeRange: string;
}

export const EnhancedUserAnalytics = ({ timeRange }: EnhancedUserAnalyticsProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, loading, error } = useEnhancedUserAnalytics({
    timeRange,
    segment: selectedSegment,
    search: searchQuery
  });

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Erro ao carregar dados</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <UserKPICard
          title="Total de Usuários"
          value={data?.overview?.totalUsers || 0}
          change={data?.overview?.userGrowth || 0}
          icon={<Users className="h-5 w-5" />}
          color="blue"
          loading={loading}
        />
        
        <UserKPICard
          title="Taxa de Ativação"
          value={`${data?.overview?.activationRate || 0}%`}
          change={data?.overview?.activationTrend || 0}
          icon={<UserCheck className="h-5 w-5" />}
          color="green"
          loading={loading}
        />
        
        <UserKPICard
          title="Health Score Médio"
          value={`${data?.overview?.avgHealthScore || 0}/100`}
          change={data?.overview?.healthTrend || 0}
          icon={<Activity className="h-5 w-5" />}
          color="purple"
          loading={loading}
        />
        
        <UserKPICard
          title="Retenção (30d)"
          value={`${data?.overview?.retentionRate || 0}%`}
          change={data?.overview?.retentionTrend || 0}
          icon={<Target className="h-5 w-5" />}
          color="orange"
          loading={loading}
        />
      </div>

      {/* Tabs para diferentes visões */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <TabsList className="grid grid-cols-4 w-fit">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="segments">Segmentação</TabsTrigger>
            <TabsTrigger value="behavior">Comportamento</TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Select value={selectedSegment} onValueChange={setSelectedSegment}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os usuários</SelectItem>
                <SelectItem value="power_users">Power Users</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="dormant">Dormentes</SelectItem>
                <SelectItem value="at_risk">Em risco</SelectItem>
                <SelectItem value="new">Novos</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UserFunnelChart data={data?.funnel} loading={loading} />
            <UserSegmentChart data={data?.segments} loading={loading} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <UserRetentionChart data={data?.retention} loading={loading} />
            <UserActivityHeatmap data={data?.activityHeatmap} loading={loading} />
            <UserGrowthTrendCard data={data?.growthTrend} loading={loading} />
          </div>
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments" className="space-y-6">
          <UserSegmentBreakdown data={data?.segmentDetails} loading={loading} />
          <UserRoleAnalysis data={data?.roleAnalysis} loading={loading} />
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="space-y-6">
          <UserEngagementMetrics data={data?.engagement} loading={loading} />
          <UserJourneyAnalysis data={data?.userJourney} loading={loading} />
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar usuários por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
          
          <UserDetailsTable 
            users={data?.userDetails || []} 
            loading={loading}
            onUserAction={(userId, action) => {
              console.log('User action:', userId, action);
            }}
          />
        </TabsContent>
      </Tabs>
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
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50'
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
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              isPositive ? 'text-green-600' : 'text-red-600'
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
          <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
          <div className="text-2xl font-bold">{data?.avgSessionTime || '25m'}</div>
          <div className="text-sm text-gray-600">Tempo médio por sessão</div>
        </div>
        
        <div className="text-center p-4 border rounded-lg">
          <Eye className="h-8 w-8 mx-auto mb-2 text-blue-500" />
          <div className="text-2xl font-bold">{data?.pageViewsPerSession || '4.2'}</div>
          <div className="text-sm text-gray-600">Pages por sessão</div>
        </div>
        
        <div className="text-center p-4 border rounded-lg">
          <Award className="h-8 w-8 mx-auto mb-2 text-green-500" />
          <div className="text-2xl font-bold">{data?.featureAdoption || '78%'}</div>
          <div className="text-sm text-gray-600">Adoção de features</div>
        </div>
        
        <div className="text-center p-4 border rounded-lg">
          <Activity className="h-8 w-8 mx-auto mb-2 text-purple-500" />
          <div className="text-2xl font-bold">{data?.dailyActiveUsers || '156'}</div>
          <div className="text-sm text-gray-600">DAU médio</div>
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
                <div className="text-lg font-semibold text-red-600">{point.dropoffRate}%</div>
                <div className="text-sm text-gray-600">{point.users} usuários</div>
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
            <span className="text-sm text-gray-600">Projeção 30 dias</span>
            <span className="font-semibold text-green-600">+{data?.projectedGrowth || 45} usuários</span>
          </div>
          
          <Progress value={data?.growthProgress || 68} className="h-2" />
          
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{data?.organicGrowth || '82%'}</div>
              <div className="text-xs text-gray-600">Crescimento Orgânico</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{data?.referralGrowth || '18%'}</div>
              <div className="text-xs text-gray-600">Via Indicações</div>
            </div>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);