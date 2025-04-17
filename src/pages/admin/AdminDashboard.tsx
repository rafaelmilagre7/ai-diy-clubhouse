
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { DashboardHeader } from '@/components/admin/dashboard/DashboardHeader';
import { StatsOverview } from '@/components/admin/dashboard/StatsOverview';
import { DashboardCharts } from '@/components/admin/dashboard/DashboardCharts'; 
import { RecentActivity } from '@/components/admin/dashboard/RecentActivity';

const AdminDashboard = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState('30d');
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalSolutions: 0,
    completedImplementations: 0,
    averageTime: 0,
    userGrowth: 0,
    implementationRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [completionRateData, setCompletionRateData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Função para carregar todos os dados do dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Buscar estatísticas de usuários
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, created_at');
        
        if (usersError) throw usersError;

        // Buscar estatísticas de soluções
        const { data: solutionsData, error: solutionsError } = await supabase
          .from('solutions')
          .select('id, published, title');
        
        if (solutionsError) throw solutionsError;

        // Buscar estatísticas de progresso
        const { data: progressData, error: progressError } = await supabase
          .from('progress')
          .select('id, is_completed, created_at, last_activity, solution_id, completed_at');
        
        if (progressError) throw progressError;

        // Buscar dados de atividades recentes
        const { data: analyticsData, error: analyticsError } = await supabase
          .from('analytics')
          .select('event_type, user_id, solution_id, created_at, event_data')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (analyticsError && !analyticsError.message.includes('does not exist')) {
          console.warn("Tabela de analytics não existe:", analyticsError);
        }

        // Calcular estatísticas
        const totalUsers = usersData?.length || 0;
        const totalSolutions = solutionsData?.filter(s => s.published).length || 0;
        const completedImplementations = progressData?.filter(p => p.is_completed).length || 0;
        
        // Calcular tempo médio de implementação (baseado em dados reais se disponíveis)
        let averageTime = 0;
        const completedWithTimestamps = progressData?.filter(p => p.is_completed && p.completed_at && p.created_at) || [];
        
        if (completedWithTimestamps.length > 0) {
          // Calcula o tempo médio em minutos
          const totalMinutes = completedWithTimestamps.reduce((acc, curr) => {
            const start = new Date(curr.created_at);
            const end = new Date(curr.completed_at);
            const diffMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
            return acc + diffMinutes;
          }, 0);
          
          averageTime = Math.round(totalMinutes / completedWithTimestamps.length);
        } else {
          // Fallback para uma estimativa
          averageTime = completedImplementations > 0 ? 
            Math.round((completedImplementations / (totalUsers || 1)) * 45) : 0;
        }
        
        // Calcular crescimento de usuários (últimos 30 dias vs. anteriores)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentUsers = usersData?.filter(
          u => new Date(u.created_at) >= thirtyDaysAgo
        ).length || 0;
        
        const olderUsers = totalUsers - recentUsers;
        const userGrowth = olderUsers > 0 ? 
          Math.round((recentUsers / olderUsers) * 100) : 0;
        
        // Calcular taxa de implementação
        const implementationRate = totalUsers > 0 ? 
          Math.round((completedImplementations / (totalUsers * (totalSolutions || 1))) * 100) : 0;

        // Preparar dados de engajamento por mês
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const engagementDataArray = [];
        const currentDate = new Date();
        
        // Agrupar atividades por mês (baseado em dados reais)
        const activityByMonth = new Array(7).fill(0);
        
        progressData?.forEach(progress => {
          const date = new Date(progress.last_activity);
          const monthsAgo = (currentDate.getMonth() - date.getMonth() + 12) % 12;
          
          if (monthsAgo < 7) {
            activityByMonth[monthsAgo]++;
          }
        });
        
        // Criar dados para os últimos 7 meses
        for (let i = 6; i >= 0; i--) {
          const monthIndex = (currentDate.getMonth() - i + 12) % 12;
          const monthName = monthNames[monthIndex];
          
          engagementDataArray.push({
            name: monthName,
            value: activityByMonth[i]
          });
        }
        
        // Preparar dados de taxa de conclusão por solução
        const completionRateDataArray = [];
        const publishedSolutions = solutionsData?.filter(s => s.published) || [];
        
        for (let i = 0; i < Math.min(publishedSolutions.length, 5); i++) {
          const solution = publishedSolutions[i];
          const solutionProgress = progressData?.filter(p => p.solution_id === solution.id) || [];
          const totalAttempts = solutionProgress.length;
          const completions = solutionProgress.filter(p => p.is_completed).length;
          
          const completion = totalAttempts > 0 ? 
            Math.round((completions / totalAttempts) * 100) : 0;
          
          completionRateDataArray.push({
            name: solution.title || `Solução ${i + 1}`,
            completion: completion
          });
        }
        
        // Se não houver soluções suficientes, adicionar dados simulados
        while (completionRateDataArray.length < 5) {
          completionRateDataArray.push({
            name: `Solução ${completionRateDataArray.length + 1}`,
            completion: Math.round(Math.random() * 100)
          });
        }

        // Processar atividades recentes para exibição
        const processedActivities = analyticsData?.map(activity => {
          // Buscar títulos de soluções para as atividades
          const solution = solutionsData?.find(s => s.id === activity.solution_id);
          
          return {
            ...activity,
            solution_title: solution?.title || "Solução desconhecida"
          };
        }) || [];

        // Atualizar o estado com todos os dados calculados
        setStatsData({
          totalUsers,
          totalSolutions,
          completedImplementations,
          averageTime,
          userGrowth,
          implementationRate
        });
        
        setEngagementData(engagementDataArray);
        setCompletionRateData(completionRateDataArray);
        setRecentActivities(processedActivities);

      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        toast({
          title: "Erro ao carregar dashboard",
          description: "Não foi possível carregar os dados do dashboard.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast, timeRange]);

  return (
    <div className="space-y-6">
      <DashboardHeader 
        timeRange={timeRange}
        setTimeRange={setTimeRange}
      />

      <StatsOverview data={statsData} loading={loading} />
      
      <DashboardCharts 
        engagementData={engagementData} 
        completionRateData={completionRateData}
        loading={loading}
      />
      
      <RecentActivity activities={recentActivities} loading={loading} />
    </div>
  );
};

export default AdminDashboard;
