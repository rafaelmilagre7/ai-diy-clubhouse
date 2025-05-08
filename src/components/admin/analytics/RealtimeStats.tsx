
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock, Users, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export const RealtimeStats = () => {
  const [stats, setStats] = useState({
    activeUsers: 0,
    avgImplementationTime: 0,
    totalCompletions: 0,
    weeklyActivity: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealtimeStats = async () => {
      try {
        setLoading(true);
        
        // Buscar número total de usuários ativos nas últimas 24 horas
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        const { data: activeUsersData, error: activeUsersError } = await supabase
          .from('progress')
          .select('user_id')
          .gte('last_activity', oneDayAgo.toISOString())
          .limit(1000);

        if (activeUsersError) throw activeUsersError;
        
        // Contar usuários únicos
        const uniqueUsers = new Set(activeUsersData?.map(p => p.user_id));
        
        // Buscar tempo médio de implementação
        const { data: completedData, error: completedError } = await supabase
          .from('progress')
          .select('created_at, completed_at')
          .eq('is_completed', true)
          .not('completed_at', 'is', null);
          
        if (completedError) throw completedError;
        
        // Calcular tempo médio em minutos
        let totalMinutes = 0;
        let completedCount = 0;
        
        if (completedData && completedData.length > 0) {
          completedData.forEach(item => {
            if (item.created_at && item.completed_at) {
              const start = new Date(item.created_at);
              const end = new Date(item.completed_at);
              const diffMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
              if (diffMinutes > 0 && diffMinutes < 10000) { // Ignorar outliers
                totalMinutes += diffMinutes;
                completedCount++;
              }
            }
          });
        }
        
        const avgTime = completedCount > 0 ? Math.round(totalMinutes / completedCount) : 0;
        
        // Buscar número total de implementações concluídas
        const { count: totalCompletions, error: completionsError } = await supabase
          .from('progress')
          .select('id', { count: 'exact', head: true })
          .eq('is_completed', true);
          
        if (completionsError) throw completionsError;
        
        // Buscar atividade semanal (últimos 7 dias)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { count: weeklyActivity, error: weeklyError } = await supabase
          .from('progress')
          .select('id', { count: 'exact', head: true })
          .gte('last_activity', sevenDaysAgo.toISOString());
          
        if (weeklyError) throw weeklyError;
        
        setStats({
          activeUsers: uniqueUsers.size,
          avgImplementationTime: avgTime,
          totalCompletions: totalCompletions || 0,
          weeklyActivity: weeklyActivity || 0
        });
        
      } catch (error) {
        console.error("Erro ao buscar estatísticas em tempo real:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRealtimeStats();
    
    // Configurar atualização periódica (a cada 5 minutos)
    const interval = setInterval(fetchRealtimeStats, 300000);
    
    return () => clearInterval(interval);
  }, []);

  const statItems = [
    {
      title: "Usuários Ativos",
      value: stats.activeUsers,
      icon: Users,
      description: "Nas últimas 24 horas"
    },
    {
      title: "Tempo Médio",
      value: `${stats.avgImplementationTime} min`,
      icon: Clock,
      description: "Para concluir implementação"
    },
    {
      title: "Implementações",
      value: stats.totalCompletions,
      icon: Award,
      description: "Total concluído"
    },
    {
      title: "Atividade Semanal",
      value: stats.weeklyActivity,
      icon: Activity,
      description: "Interações nos últimos 7 dias"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-8 w-16 bg-gray-200 rounded mt-1"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 w-36 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-2xl font-bold text-foreground mt-1">
                  {item.value}
                </CardDescription>
              </div>
              <div className="h-8 w-8 bg-primary/10 flex items-center justify-center rounded-md">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
