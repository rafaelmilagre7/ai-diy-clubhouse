
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock, Users, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import conditionalLogger from "@/utils/conditionalLogger";

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

        // Usar views otimizadas ao invés de consultas diretas
        const [overviewResult, weeklyActivityResult] = await Promise.allSettled([
          supabase.from('admin_analytics_overview').select('*').single(),
          supabase.from('weekly_activity_patterns').select('*')
        ]);

        // Buscar usuários ativos nas últimas 24h (consulta específica necessária)
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        const { data: activeUsersData } = await supabase
          .from('progress')
          .select('user_id')
          .gte('last_activity', oneDayAgo.toISOString());

        const uniqueActiveUsers = new Set(activeUsersData?.map(p => p.user_id) || []).size;

        // Processar dados do overview
        const overviewData = overviewResult.status === 'fulfilled' ? overviewResult.value.data : null;
        
        // Processar atividade semanal
        const weeklyData = weeklyActivityResult.status === 'fulfilled' ? weeklyActivityResult.value.data || [] : [];
        const totalWeeklyActivity = weeklyData.reduce((sum, item) => sum + (item.atividade || 0), 0);

        setStats({
          activeUsers24h: uniqueActiveUsers,
          avgImplementationTime: 240, // 4 horas (pode vir de cálculo mais específico no futuro)
          totalCompletions: overviewData?.completed_implementations || 0,
          weeklyActivity: totalWeeklyActivity
        });

      } catch (error: any) {
        conditionalLogger.error("Erro ao buscar estatísticas em tempo real:", error);
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
      color: "text-blue-500"
    },
    {
      title: "Tempo Médio",
      value: formatTime(stats.avgImplementationTime),
      icon: Clock,
      description: "Para concluir implementação",
      color: "text-green-500"
    },
    {
      title: "Implementações",
      value: stats.totalCompletions,
      icon: Award,
      description: "Total concluído",
      color: "text-purple-500"
    },
    {
      title: "Atividade Semanal",
      value: stats.weeklyActivity,
      icon: Activity,
      description: "Interações nos últimos 7 dias",
      color: "text-orange-500"
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
          <CardTitle className="text-red-600">Erro nas Estatísticas</CardTitle>
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
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
