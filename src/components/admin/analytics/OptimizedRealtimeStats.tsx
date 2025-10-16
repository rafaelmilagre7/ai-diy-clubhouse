
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock, Users, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { DataStatusIndicator } from "./DataStatusIndicator";

interface RealtimeStatsData {
  activeUsers24h: number;
  avgImplementationTime: number;
  totalCompletions: number;
  weeklyActivity: number;
}

export const OptimizedRealtimeStats = () => {
  const [stats, setStats] = useState<RealtimeStatsData>({
    activeUsers24h: 0,
    avgImplementationTime: 0,
    totalCompletions: 0,
    weeklyActivity: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRealtimeStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar dados de visão geral
        const { data: overviewData, error: overviewError } = await supabase
          .rpc('get_admin_analytics_overview');

        if (overviewError) throw overviewError;

        // Buscar atividade semanal
        const { data: weeklyData, error: weeklyError } = await supabase
          .rpc('get_weekly_activity_patterns');

        if (weeklyError) throw weeklyError;

        // Buscar usuários ativos nas últimas 24h
        const { data: activeUsersData, error: activeUsersError } = await supabase
          .from('analytics')
          .select('user_id')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .then(result => ({
            ...result,
            data: result.data ? new Set(result.data.map(r => r.user_id)).size : 0
          }));

        if (activeUsersError) throw activeUsersError;

        // Buscar tempo médio de implementação (dados reais)
        const { data: avgTimeData, error: avgTimeError } = await supabase
          .rpc('get_average_implementation_time');

        if (avgTimeError) throw avgTimeError;

        const newStats = {
          activeUsers24h: activeUsersData || 0,
          avgImplementationTime: avgTimeData ? (avgTimeData * 24 * 60) : 0, // Converter dias para minutos
          totalCompletions: overviewData?.total_implementations || 0,
          weeklyActivity: weeklyData?.total_events || 0
        };

        setStats(newStats);

      } catch (error: any) {
        console.error("Erro ao buscar estatísticas em tempo real:", error);
        setError(error.message || 'Erro ao carregar estatísticas');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRealtimeStats();
    
    // Atualizar a cada 5 minutos para otimizar performance
    const interval = setInterval(fetchRealtimeStats, 300000);
    
    return () => clearInterval(interval);
  }, []);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const statItems = [
    {
      title: "Usuários Ativos",
      value: stats.activeUsers24h,
      icon: Users,
      description: "Nas últimas 24 horas",
      color: "text-operational"
    },
    {
      title: "Tempo Médio",
      value: formatTime(stats.avgImplementationTime),
      icon: Clock,
      description: "Para concluir implementação",
      color: "text-success"
    },
    {
      title: "Implementações",
      value: stats.totalCompletions,
      icon: Award,
      description: "Total concluído",
      color: "text-strategy"
    },
    {
      title: "Atividade Semanal",
      value: stats.weeklyActivity,
      icon: Activity,
      description: "Interações nos últimos 7 dias",
      color: "text-warning"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Erro nas Estatísticas</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold text-foreground mt-1">
                    {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                  </CardDescription>
                </div>
                <div className="h-8 w-8 bg-primary/10 flex items-center justify-center rounded-md">
                  <IconComponent className={`h-5 w-5 ${item.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{item.description}</p>
                <DataStatusIndicator isDataReal={!loading && !error} loading={loading} error={error} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
