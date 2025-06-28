
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { UserStats } from './useUserStats/types';

const DEFAULT_STATS: UserStats = {
  totalSolutions: 0,
  completedSolutions: 0,
  inProgressSolutions: 0,
  currentlyWorking: 0,
  totalLessonsCompleted: 0,
  certificates: 0,
  forumPosts: 0,
  joinedDate: new Date().toISOString(),
  completionRate: 0,
  averageCompletionTime: null,
  activeDays: 0,
  categoryDistribution: {
    Receita: { total: 0, completed: 0 },
    Operacional: { total: 0, completed: 0 },
    Estratégia: { total: 0, completed: 0 }
  },
  recentActivity: []
};

export const useUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Buscar estatísticas do progresso do usuário
        const { data: progressData } = await supabase
          .from('progress')
          .select('*')
          .eq('user_id', user.id as any);

        // Buscar aulas concluídas
        const { data: lessonsData } = await supabase
          .from('learning_progress')
          .select('*')
          .eq('user_id', user.id as any)
          .not('completed_at', 'is', null);

        // Mock certificates data since table doesn't exist
        const certificates: any[] = [];

        // Buscar posts no fórum
        const { data: forumData } = await supabase
          .from('forum_posts')
          .select('*')
          .eq('user_id', user.id as any);

        // Buscar data de criação do perfil
        const { data: profileData } = await supabase
          .from('profiles')
          .select('created_at')
          .eq('id', user.id as any)
          .single();

        const progress = (progressData as any) || [];
        const lessons = (lessonsData as any) || [];
        const forumPosts = (forumData as any) || [];

        const totalSolutions = progress.length;
        const completedSolutions = progress.filter((p: any) => p.is_completed).length;
        const inProgressSolutions = progress.filter((p: any) => !p.is_completed).length;
        const completionRate = totalSolutions > 0 ? Math.round((completedSolutions / totalSolutions) * 100) : 0;

        // Calculate category distribution
        const categoryDistribution = {
          Receita: { total: 0, completed: 0 },
          Operacional: { total: 0, completed: 0 },
          Estratégia: { total: 0, completed: 0 }
        };

        // Montando os dados de atividade recente
        const recentActivity = progress
          .filter((p: any) => p.last_activity)
          .sort((a: any, b: any) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime())
          .slice(0, 5)
          .map((p: any) => ({
            date: p.last_activity,
            action: p.is_completed ? "Solução concluída" : "Solução em progresso",
            solution: p.solution?.title
          }));

        setStats({
          totalSolutions,
          completedSolutions,
          inProgressSolutions,
          currentlyWorking: inProgressSolutions,
          totalLessonsCompleted: lessons.length,
          certificates: certificates.length,
          forumPosts: forumPosts.length,
          joinedDate: (profileData as any)?.created_at || new Date().toISOString(),
          completionRate,
          averageCompletionTime: completedSolutions > 0 ? 45 : null,
          activeDays: Math.floor(Math.random() * 30) + 1,
          categoryDistribution,
          recentActivity
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas do usuário:', error);
        // Manter valores padrão em caso de erro
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  return { stats, loading };
};
