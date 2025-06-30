
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface SystemActivity {
  totalLogins: number;
  newUsers: number;
  activeImplementations: number;
  completedSolutions: number;
  forumActivity: number;
  learningProgress: number;
  benefitClicks: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  peakUsageHours: Array<{ hour: number; users: number }>;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user_id?: string;
  }>;
}

// Função para calcular data de início baseada no timeRange
const getStartDate = (timeRange: string): Date => {
  const now = new Date();
  
  switch (timeRange) {
    case '7d':
      now.setDate(now.getDate() - 7);
      break;
    case '30d':
      now.setDate(now.getDate() - 30);
      break;
    case '90d':
      now.setDate(now.getDate() - 90);
      break;
    case 'all':
    default:
      now.setFullYear(2020); // Data muito antiga para pegar todos os dados
      break;
  }
  
  return now;
};

export const useRealSystemActivity = (timeRange: string) => {
  const [activityData, setActivityData] = useState<SystemActivity>({
    totalLogins: 0,
    newUsers: 0,
    activeImplementations: 0,
    completedSolutions: 0,
    forumActivity: 0,
    learningProgress: 0,
    benefitClicks: 0,
    systemHealth: 'healthy',
    peakUsageHours: [],
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  const fetchSystemActivity = async () => {
    try {
      setLoading(true);
      
      // Calcular data de início baseada no timeRange
      const startDate = getStartDate(timeRange);
      const startDateISO = startDate.toISOString();
      
      // Buscar atividades do sistema com queries otimizadas
      const [
        analyticsResult,
        profilesResult,
        progressResult,
        forumTopicsResult,
        forumPostsResult,
        learningProgressResult,
        benefitClicksResult
      ] = await Promise.all([
        // Atividades de analytics (logins, etc)
        supabase
          .from('analytics')
          .select('event_type, created_at, user_id', { count: 'exact' })
          .gte('created_at', startDateISO),
        
        // Novos usuários
        supabase
          .from('profiles')
          .select('id, created_at', { count: 'exact' })
          .gte('created_at', startDateISO),
        
        // Implementações ativas e completas
        supabase
          .from('progress')
          .select('id, is_completed, created_at, completed_at', { count: 'exact' })
          .gte('created_at', startDateISO),
        
        // Atividade do fórum - tópicos
        supabase
          .from('forum_topics')
          .select('id, created_at', { count: 'exact' })
          .gte('created_at', startDateISO),
        
        // Atividade do fórum - posts
        supabase
          .from('forum_posts')
          .select('id, created_at', { count: 'exact' })
          .gte('created_at', startDateISO),
        
        // Progresso de aprendizagem
        supabase
          .from('learning_progress')
          .select('id, progress_percentage, created_at', { count: 'exact' })
          .gte('created_at', startDateISO),
        
        // Cliques em benefícios
        supabase
          .from('benefit_clicks')
          .select('id, clicked_at', { count: 'exact' })
          .gte('clicked_at', startDateISO)
      ]);

      // Processar dados de login
      const loginEvents = (analyticsResult.data || []).filter(
        event => event.event_type === 'login' || event.event_type === 'session_start'
      );

      // Implementações ativas vs completas
      const progressData = progressResult.data || [];
      const activeImplementations = progressData.filter(p => !p.is_completed).length;
      const completedSolutions = progressData.filter(p => p.is_completed).length;

      // Progresso de aprendizagem significativo (>= 50%)
      const learningData = learningProgressResult.data || [];
      const significantProgress = learningData.filter(
        lp => (lp.progress_percentage || 0) >= 50
      ).length;

      // Calcular horas de pico de uso baseado nos analytics
      const hourlyUsage = new Map<number, Set<string>>();
      (analyticsResult.data || []).forEach(event => {
        if (event.user_id) {
          const hour = new Date(event.created_at).getHours();
          if (!hourlyUsage.has(hour)) {
            hourlyUsage.set(hour, new Set());
          }
          hourlyUsage.get(hour)?.add(event.user_id);
        }
      });

      const peakUsageHours = Array.from(hourlyUsage.entries())
        .map(([hour, users]) => ({ hour, users: users.size }))
        .sort((a, b) => b.users - a.users)
        .slice(0, 6);

      // Atividades recentes diversificadas
      const recentActivities = [
        ...(forumTopicsResult.data || []).slice(0, 3).map(topic => ({
          id: topic.id,
          type: 'forum',
          description: 'Novo tópico criado no fórum',
          timestamp: topic.created_at
        })),
        ...(progressResult.data || [])
          .filter(p => p.completed_at)
          .slice(0, 2)
          .map(progress => ({
            id: progress.id,
            type: 'implementation',
            description: 'Solução implementada com sucesso',
            timestamp: progress.completed_at
          })),
        ...(learningData || [])
          .filter(lp => lp.progress_percentage === 100)
          .slice(0, 2)
          .map(lesson => ({
            id: lesson.id,
            type: 'learning',
            description: 'Aula concluída',
            timestamp: lesson.created_at
          }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      // Determinar saúde do sistema
      const totalActivity = loginEvents.length + progressData.length + 
                           (forumTopicsResult.count || 0) + (forumPostsResult.count || 0);
      
      let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (totalActivity < 10) {
        systemHealth = 'critical';
      } else if (totalActivity < 50) {
        systemHealth = 'warning';
      }

      setActivityData({
        totalLogins: loginEvents.length,
        newUsers: profilesResult.count || 0,
        activeImplementations,
        completedSolutions,
        forumActivity: (forumTopicsResult.count || 0) + (forumPostsResult.count || 0),
        learningProgress: significantProgress,
        benefitClicks: benefitClicksResult.count || 0,
        systemHealth,
        peakUsageHours,
        recentActivities
      });

      console.log(`✅ Atividade do sistema otimizada para período ${timeRange}:`, {
        totalLogins: loginEvents.length,
        newUsers: profilesResult.count || 0,
        activeImplementations,
        completedSolutions,
        systemHealth,
        period: timeRange,
        startDate: startDateISO
      });

    } catch (error) {
      console.error('Erro ao buscar atividade do sistema:', error);
      
      // Fallback com dados estruturados
      setActivityData({
        totalLogins: 0,
        newUsers: 0,
        activeImplementations: 0,
        completedSolutions: 0,
        forumActivity: 0,
        learningProgress: 0,
        benefitClicks: 0,
        systemHealth: 'critical',
        peakUsageHours: [],
        recentActivities: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemActivity();
  }, [timeRange]);

  return { activityData, loading, refetch: fetchSystemActivity };
};
