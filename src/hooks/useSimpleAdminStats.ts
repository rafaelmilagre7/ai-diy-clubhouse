
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface SimpleAdminStats {
  totalUsers: number;
  totalCourses: number;
  totalLessons: number;
  totalProgress: number;
  loading: boolean;
  error: string | null;
}

export const useSimpleAdminStats = (): SimpleAdminStats => {
  const [stats, setStats] = useState<SimpleAdminStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalLessons: 0,
    totalProgress: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Buscar contagem de usuários
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (usersError) throw usersError;

        // Buscar contagem de cursos
        const { count: coursesCount, error: coursesError } = await supabase
          .from('learning_courses')
          .select('*', { count: 'exact', head: true });

        if (coursesError) throw coursesError;

        // Buscar contagem de aulas
        const { count: lessonsCount, error: lessonsError } = await supabase
          .from('learning_lessons')
          .select('*', { count: 'exact', head: true });

        if (lessonsError) throw lessonsError;

        // Buscar contagem de progresso
        const { count: progressCount, error: progressError } = await supabase
          .from('learning_progress')
          .select('*', { count: 'exact', head: true });

        if (progressError) throw progressError;

        setStats({
          totalUsers: usersCount || 0,
          totalCourses: coursesCount || 0,
          totalLessons: lessonsCount || 0,
          totalProgress: progressCount || 0,
          loading: false,
          error: null
        });
      } catch (error: any) {
        console.error('Erro ao buscar estatísticas admin:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Erro desconhecido'
        }));
      }
    };

    fetchStats();
  }, []);

  return stats;
};
