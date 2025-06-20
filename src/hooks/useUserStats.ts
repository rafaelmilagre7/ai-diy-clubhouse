
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

interface UserStats {
  totalSolutions: number;
  completedSolutions: number;
  inProgressSolutions: number;
  currentlyWorking: number;
  totalLessonsCompleted: number;
  certificates: number;
  forumPosts: number;
  joinedDate: string;
  completionRate: number;
  averageCompletionTime: number | null;
  activeDays: number;
  categoryDistribution?: any;
  recentActivity?: any[];
}

export const useUserStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
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
  });
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

        // Buscar certificados
        const { data: certificatesData } = await supabase
          .from('learning_certificates')
          .select('*')
          .eq('user_id', user.id as any);

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
        const certificates = (certificatesData as any) || [];
        const forumPosts = (forumData as any) || [];

        const totalSolutions = progress.length;
        const completedSolutions = progress.filter((p: any) => p.is_completed).length;
        const inProgressSolutions = progress.filter((p: any) => !p.is_completed).length;
        const completionRate = totalSolutions > 0 ? Math.round((completedSolutions / totalSolutions) * 100) : 0;

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
          averageCompletionTime: completedSolutions > 0 ? 45 : null, // Placeholder
          activeDays: Math.floor(Math.random() * 30) + 1, // Placeholder
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
