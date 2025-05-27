
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface PerformanceChartsProps {
  queryStats: any;
}

export const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ queryStats }) => {
  // Dados mockados para os gráficos (em uma implementação real, viriam das métricas)
  const performanceOverTime = [
    { time: '00:00', avgTime: 1200, queries: 45 },
    { time: '04:00', avgTime: 980, queries: 32 },
    { time: '08:00', avgTime: 1450, queries: 67 },
    { time: '12:00', avgTime: 1680, queries: 89 },
    { time: '16:00', avgTime: 1320, queries: 76 },
    { time: '20:00', avgTime: 1100, queries: 54 },
  ];

  const errorsByType = [
    { name: 'Network', value: 45, color: '#ef4444' },
    { name: 'Timeout', value: 23, color: '#f97316' },
    { name: 'Auth', value: 12, color: '#eab308' },
    { name: 'Validation', value: 8, color: '#22c55e' },
  ];

  const slowestEndpoints = [
    { endpoint: '/api/solutions', avgTime: 2340, calls: 156 },
    { endpoint: '/api/users', avgTime: 1890, calls: 234 },
    { endpoint: '/api/courses', avgTime: 1670, calls: 98 },
    { endpoint: '/api/analytics', avgTime: 1450, calls: 67 },
    { endpoint: '/api/onboarding', avgTime: 1230, calls: 189 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.dataKey === 'avgTime' && 'ms'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!queryStats) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Performance ao Longo do Tempo */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Performance ao Longo do Tempo</CardTitle>
          <CardDescription>
            Tempo médio de resposta e número de queries por período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="avgTime"
                stroke="#0ABAB5"
                fill="#0ABAB5"
                fillOpacity={0.3}
                name="Tempo Médio"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="queries"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.3}
                name="Nº de Queries"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Endpoints Mais Lentos */}
      <Card>
        <CardHeader>
          <CardTitle>Endpoints Mais Lentos</CardTitle>
          <CardDescription>
            Top 5 endpoints com maior tempo de resposta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={slowestEndpoints} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="endpoint" type="category" width={120} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avgTime" fill="#0ABAB5" name="Tempo Médio (ms)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribuição de Erros */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Erro</CardTitle>
          <CardDescription>
            Distribuição dos erros por categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={errorsByType}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {errorsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Estatísticas Resumidas */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Estatísticas das Últimas 24h</CardTitle>
          <CardDescription>
            Resumo das métricas de performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {queryStats.totalQueries || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total de Queries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {queryStats.successRate?.toFixed(1) || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Taxa de Sucesso</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {queryStats.avgDuration?.toFixed(0) || 0}ms
              </div>
              <div className="text-sm text-muted-foreground">Tempo Médio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {queryStats.cacheHitRate?.toFixed(1) || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceCharts;
