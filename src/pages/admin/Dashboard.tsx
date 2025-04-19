
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import LoadingScreen from "@/components/common/LoadingScreen";
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { StatsOverview } from "@/components/admin/dashboard/StatsOverview";
import { DashboardCharts } from "@/components/admin/dashboard/DashboardCharts";
import { RecentActivity } from "@/components/admin/dashboard/RecentActivity";

const AdminDashboard = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalSolutions: 0,
    completedImplementations: 0,
    averageTime: 0,
    userGrowth: 0,
    implementationRate: 0
  });
  const [engagementData, setEngagementData] = useState([]);
  const [completionRateData, setCompletionRateData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  // Função para carregar dados reais do dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log("Buscando dados reais do dashboard...");
        setLoading(true);

        // Buscar estatísticas de usuários
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, created_at');
        
        if (usersError) {
          console.error("Erro ao buscar usuários:", usersError);
          throw usersError;
        }
        
        console.log(`Usuários encontrados: ${usersData?.length || 0}`);

        // Buscar estatísticas de soluções publicadas
        const { data: solutionsData, error: solutionsError } = await supabase
          .from('solutions')
          .select('id, published, title')
          .eq('published', true);
        
        if (solutionsError) {
          console.error("Erro ao buscar soluções:", solutionsError);
          throw solutionsError;
        }
        
        console.log(`Soluções publicadas encontradas: ${solutionsData?.length || 0}`);

        // Buscar estatísticas de progresso
        const { data: progressData, error: progressError } = await supabase
          .from('progress')
          .select('id, is_completed, created_at, last_activity, solution_id, completed_at');
        
        if (progressError) {
          console.error("Erro ao buscar progresso:", progressError);
          throw progressError;
        }
        
        console.log(`Registros de progresso encontrados: ${progressData?.length || 0}`);
        console.log(`Implementações completas: ${progressData?.filter(p => p.is_completed)?.length || 0}`);

        // Calcular estatísticas reais
        const totalUsers = usersData?.length || 0;
        const totalSolutions = solutionsData?.length || 0;
        const completedImplementations = progressData?.filter(p => p.is_completed)?.length || 0;
        
        // Calcular tempo médio de implementação baseado em dados reais
        let averageTime = 0;
        const completedWithTimestamps = progressData?.filter(p => p.is_completed && p.completed_at && p.created_at) || [];
        
        if (completedWithTimestamps.length > 0) {
          const totalMinutes = completedWithTimestamps.reduce((acc, curr) => {
            const start = new Date(curr.created_at);
            const end = new Date(curr.completed_at || curr.last_activity);
            const diffMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
            return acc + (diffMinutes > 0 && diffMinutes < 10080 ? diffMinutes : 0); // Ignorar tempos irreais (> 1 semana)
          }, 0);
          
          averageTime = Math.round(totalMinutes / completedWithTimestamps.length);
        }
        
        // Calcular crescimento de usuários (últimos 30 dias vs. total)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentUsers = usersData?.filter(
          u => new Date(u.created_at) >= thirtyDaysAgo
        ).length || 0;
        
        const userGrowth = totalUsers > 0 ? 
          Math.round((recentUsers / totalUsers) * 100) : 0;
        
        // Calcular taxa de implementação (% de implementações concluídas em relação ao total possível)
        // Total possível = usuários × soluções
        const possibleImplementations = totalUsers * totalSolutions;
        const implementationRate = possibleImplementations > 0 ? 
          Math.min(100, Math.round((completedImplementations / possibleImplementations) * 100)) : 0;

        console.log("Estatísticas calculadas:", {
          totalUsers,
          totalSolutions,
          completedImplementations,
          averageTime,
          userGrowth,
          implementationRate
        });

        // Preparar dados de engajamento por mês (dados reais)
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const engagementDataArray = [];
        const currentDate = new Date();
        
        // Agrupar atividades por mês
        const activityByMonth = {};
        
        // Inicializar últimos 6 meses
        for (let i = 5; i >= 0; i--) {
          const monthIndex = (currentDate.getMonth() - i + 12) % 12;
          const year = new Date(currentDate).setMonth(currentDate.getMonth() - i);
          const yearStr = new Date(year).getFullYear();
          const monthKey = `${yearStr}-${monthIndex + 1}`;
          activityByMonth[monthKey] = 0;
        }
        
        // Contar atividades por mês
        progressData?.forEach(progress => {
          const date = new Date(progress.last_activity);
          const monthIndex = date.getMonth();
          const monthKey = `${date.getFullYear()}-${monthIndex + 1}`;
          
          if (activityByMonth[monthKey] !== undefined) {
            activityByMonth[monthKey]++;
          }
        });
        
        // Formatar para gráfico
        Object.entries(activityByMonth).forEach(([key, value]) => {
          const [year, month] = key.split('-');
          const monthIndex = parseInt(month) - 1;
          engagementDataArray.push({
            name: `${monthNames[monthIndex]}`,
            value: value
          });
        });
        
        // Preparar dados de conclusão por solução (dados reais)
        const completionRateDataArray = [];
        
        if (solutionsData && solutionsData.length > 0) {
          for (let i = 0; i < Math.min(solutionsData.length, 5); i++) {
            const solution = solutionsData[i];
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
        }
        
        // Preencher com dados vazios se não houver soluções suficientes
        while (completionRateDataArray.length < 5) {
          completionRateDataArray.push({
            name: `Solução ${completionRateDataArray.length + 1}`,
            completion: 0
          });
        }

        // Buscar dados de atividades recentes (reais)
        const { data: analyticsData, error: analyticsError } = await supabase
          .from('analytics')
          .select('event_type, user_id, solution_id, created_at, event_data')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (analyticsError && !analyticsError.message.includes('does not exist')) {
          console.warn("Erro ao buscar analytics:", analyticsError);
        }
        
        // Processar atividades recentes
        const processedActivities = analyticsData?.map(activity => {
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
