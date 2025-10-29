
import { useState, useEffect } from "react";
import { useToastModern } from "@/hooks/useToastModern";
import { supabase } from "@/lib/supabase";

interface StatsData {
  // Dados cumulativos
  totalUsers: number;
  totalSolutions: number;
  totalLearningLessons: number;
  completedImplementations: number;
  averageImplementationTime: number;
  usersByRole: { role: string; count: number }[];
  
  // Dados específicos do período
  newUsersInPeriod: number;
  activeUsersInPeriod: number;
  implementationsInPeriod: number;
  completedInPeriod: number;
  
  // Métricas calculadas
  periodGrowthRate: number;
  periodEngagementRate: number;
  periodCompletionRate: number;
  
  // Identificador do período para forçar re-render
  timeRange: string;
  lastUpdated: string;
  
  // Campos de compatibilidade
  lastMonthGrowth: number;
  activeUsersLast7Days: number;
  contentEngagementRate: number;
}

export const useRealAdminStats = (timeRange: string) => {
  const { showError } = useToastModern();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<StatsData>({
    totalUsers: 0,
    totalSolutions: 0,
    totalLearningLessons: 0,
    completedImplementations: 0,
    averageImplementationTime: 240,
    usersByRole: [],
    newUsersInPeriod: 0,
    activeUsersInPeriod: 0,
    implementationsInPeriod: 0,
    completedInPeriod: 0,
    periodGrowthRate: 0,
    periodEngagementRate: 0,
    periodCompletionRate: 0,
    timeRange: timeRange,
    lastUpdated: new Date().toISOString(),
    lastMonthGrowth: 0,
    activeUsersLast7Days: 0,
    contentEngagementRate: 0
  });

  const refetch = async () => {
    try {
      setLoading(true);
      
      // Buscar data atual do banco usando uma query simples
      const { data: nowResult } = await supabase
        .from('progress')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      const bankNow = nowResult?.created_at ? new Date(nowResult.created_at) : new Date();
      
      // Calcular período baseado na data mais recente dos dados
      const daysMap: { [key: string]: number } = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      };
      
      const daysBack = daysMap[timeRange] || 30;
      const startDate = new Date(bankNow);
      startDate.setDate(startDate.getDate() - daysBack);

      // === DADOS CUMULATIVOS (não mudam com período) ===
      
      // Total de usuários
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Total de soluções
      const { count: totalSolutions } = await supabase
        .from('solutions')
        .select('*', { count: 'exact', head: true })
        .eq('published', true);

      // Total de aulas
      const { count: totalLearningLessons } = await supabase
        .from('learning_lessons')
        .select('*', { count: 'exact', head: true })
        .eq('published', true);

      // Total de implementações completas
      const { count: completedImplementations } = await supabase
        .from('progress')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', true);

      // Segmentação de usuários por role - corrigir consulta
      const { data: userRoles } = await supabase
        .from('profiles')
        .select(`
          role_id,
          user_roles (
            name
          )
        `)
        .not('role_id', 'is', null);

      // Processar contagem por roles
      const roleCount: { [key: string]: number } = {};
      userRoles?.forEach(user => {
        const roleName = (user.user_roles as any)?.name || 'Outros';
        roleCount[roleName] = (roleCount[roleName] || 0) + 1;
      });

      const userSegmentation = Object.entries(roleCount).map(([name, count]) => ({
        role_name: name,
        user_count: count
      }));

      // === DADOS ESPECÍFICOS DO PERÍODO ===

      // Novos usuários no período
      const { count: newUsersInPeriod } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Pessoas únicas que iniciaram implementações no período
      const { data: usersStarted } = await supabase
        .from('progress')
        .select('user_id')
        .gte('created_at', startDate.toISOString());
      
      const activeImplementationsInPeriod = usersStarted 
        ? new Set(usersStarted.map(p => p.user_id)).size 
        : 0;

      // Pessoas únicas que completaram implementações no período
      const { data: usersCompleted } = await supabase
        .from('progress')
        .select('user_id')
        .eq('is_completed', true)
        .gte('created_at', startDate.toISOString());
      
      const completedInPeriod = usersCompleted
        ? new Set(usersCompleted.map(p => p.user_id)).size
        : 0;

      // Usuários ativos no período = total de usuários (tabela analytics está vazia)
      // Vamos usar o total de usuários como proxy
      const activeUsersInPeriod = totalUsers || 0;

      // === CALCULAR MÉTRICAS ===
      
      // Taxa de crescimento do período
      const periodGrowthRate = totalUsers && totalUsers > 0 ? 
        Math.round(((newUsersInPeriod || 0) / totalUsers) * 100) : 0;

      // Taxa de engajamento do período
      const periodEngagementRate = totalUsers && totalUsers > 0 ? 
        Math.round((activeUsersInPeriod / totalUsers) * 100) : 0;

      // Taxa de conclusão do período
      const totalImplementationsInPeriod = activeImplementationsInPeriod || 0;
      const periodCompletionRate = totalImplementationsInPeriod > 0 ? 
        Math.round(((completedInPeriod || 0) / totalImplementationsInPeriod) * 100) : 0;

      // Processar roles corrigido
      const usersByRole = (userSegmentation || []).map(item => ({
        role: item.role_name === 'member' ? 'Membros Club' : 
              item.role_name === 'admin' ? 'Administradores' :
              item.role_name === 'formacao' ? 'Formação' : 
              item.role_name === 'membro_club' ? 'Membros Club' :
              item.role_name || 'Outros',
        count: item.user_count || 0
      }));

      const finalStats: StatsData = {
        // Dados cumulativos corretos
        totalUsers: totalUsers || 0,
        totalSolutions: totalSolutions || 0,
        totalLearningLessons: totalLearningLessons || 0,
        completedImplementations: completedImplementations || 0,
        averageImplementationTime: 240, // 4 horas em minutos
        usersByRole,
        
        // Dados específicos do período
        newUsersInPeriod: newUsersInPeriod || 0,
        activeUsersInPeriod: activeUsersInPeriod || 0,
        implementationsInPeriod: activeImplementationsInPeriod || 0,
        completedInPeriod: completedInPeriod || 0,
        
        // Métricas calculadas
        periodGrowthRate,
        periodEngagementRate,
        periodCompletionRate,
        
        // Identificadores para forçar re-render
        timeRange,
        lastUpdated: new Date().toISOString(),
        
        // Campos de compatibilidade
        lastMonthGrowth: periodGrowthRate,
        activeUsersLast7Days: activeUsersInPeriod,
        contentEngagementRate: periodEngagementRate
      };

      setStatsData(finalStats);

    } catch (error: any) {
      console.error("❌ [STATS] Erro ao carregar estatísticas:", error);
      showError("Erro ao carregar estatísticas", "Ocorreu um erro ao carregar os dados estatísticos.");
    } finally {
      setLoading(false);
    }
  };

  // Automaticamente atualiza quando timeRange muda
  useEffect(() => {
    // Limpar dados antigos e carregar novos
    setStatsData(prev => ({
      ...prev,
      timeRange,
      lastUpdated: new Date().toISOString()
    }));
    refetch();
  }, [timeRange]);

  return { statsData, loading, refetch };
};
