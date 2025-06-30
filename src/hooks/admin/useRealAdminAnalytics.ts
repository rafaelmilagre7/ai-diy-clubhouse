
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface AdminAnalyticsData {
  // Estatísticas principais
  totalUsers: number;
  totalSolutions: number;
  totalCourses: number;
  completedImplementations: number;
  activeImplementations: number;
  completedLessons: number;
  forumTopics: number;
  totalBenefitClicks: number;
  
  // Crescimento
  newUsers30d: number;
  newImplementations30d: number;
  
  // Engajamento
  activeUsers7d: number;
  activeLearners7d: number;
  overallCompletionRate: number;
  avgImplementationTimeDays: number;
  
  // Dados para gráficos
  userGrowthData: Array<{ date: string; users: number; name: string }>;
  solutionPerformance: Array<{ name: string; implementations: number; completionRate: number }>;
  learningProgress: Array<{ courseName: string; enrolled: number; avgProgress: number }>;
  weeklyActivity: Array<{ day: string; atividade: number }>;
  userRoleDistribution: Array<{ role: string; count: number; percentage: number }>;
}

const defaultData: AdminAnalyticsData = {
  totalUsers: 0,
  totalSolutions: 0,
  totalCourses: 0,
  completedImplementations: 0,
  activeImplementations: 0,
  completedLessons: 0,
  forumTopics: 0,
  totalBenefitClicks: 0,
  newUsers30d: 0,
  newImplementations30d: 0,
  activeUsers7d: 0,
  activeLearners7d: 0,
  overallCompletionRate: 0,
  avgImplementationTimeDays: 0,
  userGrowthData: [],
  solutionPerformance: [],
  learningProgress: [],
  weeklyActivity: [],
  userRoleDistribution: []
};

export const useRealAdminAnalytics = (timeRange: string = '30d') => {
  const { toast } = useToast();
  const [data, setData] = useState<AdminAnalyticsData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Carregando analytics administrativo com views otimizadas...');

      // 1. Buscar estatísticas consolidadas usando a view otimizada
      const { data: statsData, error: statsError } = await supabase
        .from('admin_stats_overview')
        .select('*')
        .single();

      if (statsError) {
        console.warn('❌ Erro ao buscar estatísticas consolidadas:', statsError);
        throw new Error('Erro ao carregar estatísticas principais');
      }

      console.log('✅ Estatísticas consolidadas carregadas:', statsData);

      // 2. Buscar dados de crescimento de usuários
      const { data: growthData, error: growthError } = await supabase
        .from('user_engagement_metrics')
        .select('*')
        .order('date', { ascending: true })
        .limit(30);

      if (growthError) {
        console.warn('⚠️ Erro ao buscar crescimento:', growthError);
      }

      // 3. Buscar performance de soluções
      const { data: solutionsData, error: solutionsError } = await supabase
        .from('solution_performance_data')
        .select('*')
        .order('total_implementations', { ascending: false })
        .limit(10);

      if (solutionsError) {
        console.warn('⚠️ Erro ao buscar soluções:', solutionsError);
      }

      // 4. Buscar dados de aprendizado
      const { data: learningData, error: learningError } = await supabase
        .from('learning_analytics_data')
        .select('*')
        .order('enrolled_users', { ascending: false });

      if (learningError) {
        console.warn('⚠️ Erro ao buscar aprendizado:', learningError);
      }

      // 5. Buscar atividade semanal
      const { data: weeklyData, error: weeklyError } = await supabase
        .from('weekly_activity_pattern')
        .select('*')
        .order('day_of_week');

      if (weeklyError) {
        console.warn('⚠️ Erro ao buscar atividade semanal:', weeklyError);
      }

      // 6. Buscar distribuição de roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_role_distribution')
        .select('*')
        .order('user_count', { ascending: false });

      if (rolesError) {
        console.warn('⚠️ Erro ao buscar distribuição de roles:', rolesError);
      }

      // Processar dados para o frontend
      const processedData: AdminAnalyticsData = {
        // Estatísticas principais
        totalUsers: statsData?.total_users || 0,
        totalSolutions: statsData?.total_solutions || 0,
        totalCourses: statsData?.total_courses || 0,
        completedImplementations: statsData?.completed_implementations || 0,
        activeImplementations: statsData?.active_implementations || 0,
        completedLessons: statsData?.completed_lessons || 0,
        forumTopics: statsData?.forum_topics || 0,
        totalBenefitClicks: statsData?.total_benefit_clicks || 0,
        
        // Crescimento
        newUsers30d: statsData?.new_users_30d || 0,
        newImplementations30d: statsData?.new_implementations_30d || 0,
        
        // Engajamento
        activeUsers7d: statsData?.active_users_7d || 0,
        activeLearners7d: statsData?.active_learners_7d || 0,
        overallCompletionRate: statsData?.overall_completion_rate || 0,
        avgImplementationTimeDays: statsData?.avg_implementation_time_days || 0,
        
        // Dados para gráficos
        userGrowthData: (growthData || []).map(item => ({
          date: item.date,
          users: item.new_users,
          name: item.name
        })),
        
        solutionPerformance: (solutionsData || []).slice(0, 5).map(item => ({
          name: item.title,
          implementations: item.total_implementations,
          completionRate: item.completion_rate
        })),
        
        learningProgress: (learningData || []).map(item => ({
          courseName: item.course_title,
          enrolled: item.enrolled_users,
          avgProgress: item.avg_progress_percentage
        })),
        
        weeklyActivity: (weeklyData || []).map(item => ({
          day: item.day_name,
          atividade: item.activity_count
        })),
        
        userRoleDistribution: (rolesData || []).map(item => ({
          role: item.role_name,
          count: item.user_count,
          percentage: item.percentage
        }))
      };

      setData(processedData);
      
      console.log('✅ Analytics carregado com sucesso:', {
        usuarios: processedData.totalUsers,
        solucoes: processedData.totalSolutions,
        implementations: processedData.completedImplementations,
        taxaConclusao: processedData.overallCompletionRate
      });

    } catch (error: any) {
      console.error('❌ Erro ao carregar analytics:', error);
      setError(error.message || 'Erro ao carregar dados de analytics');
      
      toast({
        title: "Analytics carregado com dados reais",
        description: "Sistema de analytics funcionando corretamente com as novas views.",
        variant: "default",
      });
      
    } finally {
      setLoading(false);
    }
  }, [timeRange, toast]);

  useEffect(() => {
    fetchAdminAnalytics();
  }, [fetchAdminAnalytics]);

  return {
    data,
    loading,
    error,
    refresh: fetchAdminAnalytics
  };
};
