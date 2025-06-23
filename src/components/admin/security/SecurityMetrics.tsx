
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, AlertTriangle, Clock, Eye, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export const SecurityMetrics = () => {
  const [metrics, setMetrics] = useState({
    totalAuditLogs: 0,
    activeSessions: 0,
    failedLogins: 0,
    recentAlerts: 0,
    averageSessionTime: '0m',
    securityScore: 85
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        // Carregar métricas reais dos logs de auditoria
        const { data: auditLogs, error } = await supabase
          .from('audit_logs')
          .select('*', { count: 'exact', head: true });

        if (!error) {
          setMetrics(prev => ({
            ...prev,
            totalAuditLogs: auditLogs?.length || 0
          }));
        }

        // Simular outras métricas para demonstração
        setMetrics(prev => ({
          ...prev,
          activeSessions: Math.floor(Math.random() * 50) + 10,
          failedLogins: Math.floor(Math.random() * 5),
          recentAlerts: Math.floor(Math.random() * 3),
          averageSessionTime: `${Math.floor(Math.random() * 60) + 15}m`,
          securityScore: Math.floor(Math.random() * 20) + 80
        }));

      } catch (error) {
        console.error('Erro ao carregar métricas de segurança:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
    // Atualizar métricas a cada 30 segundos
    const interval = setInterval(loadMetrics, 30000);

    return () => clearInterval(interval);
  }, []);

  const metricCards = [
    {
      title: 'Logs de Auditoria',
      value: loading ? '...' : metrics.totalAuditLogs.toLocaleString(),
      icon: Activity,
      description: 'Total de eventos registrados',
      color: 'text-blue-600'
    },
    {
      title: 'Sessões Ativas',
      value: loading ? '...' : metrics.activeSessions,
      icon: Users,
      description: 'Usuários conectados agora',
      color: 'text-green-600'
    },
    {
      title: 'Logins Falhados',
      value: loading ? '...' : metrics.failedLogins,
      icon: AlertTriangle,
      description: 'Últimas 24 horas',
      color: 'text-red-600'
    },
    {
      title: 'Alertas Recentes',
      value: loading ? '...' : metrics.recentAlerts,
      icon: Eye,
      description: 'Alertas não resolvidos',
      color: 'text-orange-600'
    },
    {
      title: 'Tempo Médio de Sessão',
      value: loading ? '...' : metrics.averageSessionTime,
      icon: Clock,
      description: 'Duração média das sessões',
      color: 'text-purple-600'
    },
    {
      title: 'Score de Segurança',
      value: loading ? '...' : `${metrics.securityScore}%`,
      icon: TrendingUp,
      description: 'Avaliação geral do sistema',
      color: metrics.securityScore >= 80 ? 'text-green-600' : 'text-yellow-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metricCards.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
