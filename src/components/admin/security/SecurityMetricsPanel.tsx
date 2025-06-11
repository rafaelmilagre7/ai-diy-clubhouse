
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Activity, Shield, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface MetricData {
  metric_name: string;
  metric_value: number;
  metric_type: string;
  labels: Record<string, any>;
  recorded_at: string;
}

export const SecurityMetricsPanel = () => {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const hoursBack = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720; // 30d
      const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('security_metrics')
        .select('*')
        .gte('recorded_at', since)
        .order('recorded_at', { ascending: true });

      if (error) throw error;
      setMetrics(data || []);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Processar dados para os gráficos
  const processTimeSeriesData = (metricName: string) => {
    return metrics
      .filter(m => m.metric_name === metricName)
      .map(m => ({
        timestamp: new Date(m.recorded_at).toLocaleDateString('pt-BR'),
        value: Number(m.metric_value),
        hour: new Date(m.recorded_at).getHours()
      }));
  };

  const processSeverityData = () => {
    const severityMetrics = metrics.filter(m => m.metric_name === 'security_events_by_severity');
    const severityMap = {};
    
    severityMetrics.forEach(m => {
      const severity = m.labels?.severity || 'unknown';
      severityMap[severity] = (severityMap[severity] || 0) + Number(m.metric_value);
    });

    return Object.entries(severityMap).map(([severity, value]) => ({
      name: severity,
      value: Number(value),
      color: getSeverityColor(severity)
    }));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#65a30d';
      default: return '#6b7280';
    }
  };

  const activeUsersData = processTimeSeriesData('active_users_24h');
  const anomaliesData = processTimeSeriesData('anomalies_detected_24h');
  const severityData = processSeverityData();

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Métricas de Segurança</h3>
          <p className="text-sm text-muted-foreground">
            Análise temporal dos eventos de segurança
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24 horas</SelectItem>
            <SelectItem value="7d">7 dias</SelectItem>
            <SelectItem value="30d">30 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usuários Ativos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Usuários Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeUsersData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={activeUsersData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                Sem dados para o período selecionado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Anomalias Detectadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Anomalias Detectadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {anomaliesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={anomaliesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                Sem dados para o período selecionado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribuição por Severidade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Eventos por Severidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            {severityData.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2">
                  {severityData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                Sem dados para o período selecionado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo Estatístico */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Resumo Estatístico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {metrics.filter(m => m.metric_name === 'active_users_24h').length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Pontos de dados
                  </div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(
                      metrics
                        .filter(m => m.metric_name === 'active_users_24h')
                        .reduce((acc, m) => acc + Number(m.metric_value), 0) /
                      Math.max(1, metrics.filter(m => m.metric_name === 'active_users_24h').length)
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Média de usuários
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total de métricas coletadas:</span>
                  <Badge variant="secondary">{metrics.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Período de análise:</span>
                  <Badge variant="outline">{timeRange}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
