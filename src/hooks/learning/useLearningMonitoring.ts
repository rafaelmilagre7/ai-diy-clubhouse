import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

interface LearningStats {
  totalLessons: number;
  completedLessons: number;
  totalComments: number;
  totalNpsRatings: number;
  averageNpsScore: number;
  completionRate: number;
  lastActivity: string | null;
  streakDays: number;
  certificates: number;
}

export const useLearningMonitoring = () => {
  const { user } = useAuth();

  // Stats do usuário atual
  const { data: userStats, isLoading: loadingUserStats } = useQuery({
    queryKey: ['learning-user-stats', user?.id],
    queryFn: async (): Promise<LearningStats> => {
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar total de aulas disponíveis
      const { count: totalLessons } = await supabase
        .from('learning_lessons')
        .select('*', { count: 'exact', head: true })
        .eq('published', true);

      // Buscar progresso do usuário
      const { data: userProgress } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id);

      const completedLessons = userProgress?.filter(p => p.progress_percentage >= 100).length || 0;

      // Buscar comentários do usuário
      const { count: totalComments } = await supabase
        .from('learning_comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Buscar avaliações NPS do usuário
      const { data: npsRatings } = await supabase
        .from('learning_lesson_nps')
        .select('score, created_at')
        .eq('user_id', user.id);

      const totalNpsRatings = npsRatings?.length || 0;
      const averageNpsScore = totalNpsRatings > 0 
        ? Math.round((npsRatings?.reduce((sum, rating) => sum + rating.score, 0) || 0) / totalNpsRatings)
        : 0;

      // Buscar certificados
      const { count: certificates } = await supabase
        .from('learning_certificates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Calcular última atividade
      const activities = [
        ...(userProgress?.map(p => p.updated_at) || []),
        ...(npsRatings?.map(r => r.created_at) || [])
      ].sort().reverse();

      const lastActivity = activities[0] || null;

      // Calcular streak (dias consecutivos)
      const streakDays = calculateStreak(activities);

      return {
        totalLessons: totalLessons || 0,
        completedLessons,
        totalComments: totalComments || 0,
        totalNpsRatings,
        averageNpsScore,
        completionRate: totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0,
        lastActivity,
        streakDays,
        certificates: certificates || 0
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 10 * 60 * 1000 // 10 minutos
  });

  // Stats globais da plataforma (apenas para admins)
  const { data: globalStats, isLoading: loadingGlobalStats } = useQuery({
    queryKey: ['learning-global-stats'],
    queryFn: async () => {
      // Verificar se é admin
      const { data: isAdmin } = await supabase.rpc('is_admin_secure', {
        target_user_id: user?.id
      });

      if (!isAdmin) return null;

      // Total de usuários ativos
      const { count: activeUsers } = await supabase
        .from('learning_progress')
        .select('user_id', { count: 'exact', head: true })
        .gte('updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // últimos 30 dias

      // Total de aulas completadas
      const { count: totalCompletions } = await supabase
        .from('learning_progress')
        .select('*', { count: 'exact', head: true })
        .gte('progress_percentage', 100);

      // Engagement (comentários + NPS)
      const { count: totalEngagement } = await supabase
        .from('learning_comments')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // última semana

      return {
        activeUsers: activeUsers || 0,
        totalCompletions: totalCompletions || 0,
        weeklyEngagement: totalEngagement || 0
      };
    },
    enabled: !!user,
    staleTime: 15 * 60 * 1000 // 15 minutos
  });

  // Função para fazer backup manual do progresso
  const backupProgress = async () => {
    if (!user) return null;

    try {
      const { data } = await supabase.rpc('backup_user_learning_progress', {
        target_user_id: user.id
      });
      return data;
    } catch (error) {
      console.error('Erro ao fazer backup:', error);
      return null;
    }
  };

  return {
    userStats,
    globalStats,
    loadingUserStats,
    loadingGlobalStats,
    backupProgress
  };
};

// Função auxiliar para calcular streak
function calculateStreak(activities: string[]): number {
  if (!activities.length) return 0;

  const today = new Date();
  const sortedDates = activities
    .map(activity => new Date(activity).toDateString())
    .filter((date, index, array) => array.indexOf(date) === index) // remover duplicatas
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // ordenar desc

  if (!sortedDates.length) return 0;

  let streak = 0;
  let currentDate = today;

  for (const dateStr of sortedDates) {
    const activityDate = new Date(dateStr);
    const diffDays = Math.floor((currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === streak) {
      streak++;
      currentDate = activityDate;
    } else if (diffDays > streak) {
      break;
    }
  }

  return streak;
}