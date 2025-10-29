
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToastModern } from '@/hooks/useToastModern';

interface LmsAnalyticsData {
  totalCourses: number;
  totalLessons: number;
  totalEnrollments: number;
  averageProgress: number;
  coursePerformance: Array<{
    courseName: string;
    enrolled: number;
    avgProgress: number;
    completions: number;
  }>;
  progressDistribution: Array<{
    name: string;
    value: number;
  }>;
}

export const useLmsAnalyticsData = (timeRange: string) => {
  const { showError } = useToastModern();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LmsAnalyticsData>({
    totalCourses: 0,
    totalLessons: 0,
    totalEnrollments: 0,
    averageProgress: 0,
    coursePerformance: [],
    progressDistribution: []
  });

  useEffect(() => {
    const fetchLmsAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar métricas de performance dos cursos da nova view
        const { data: courseData, error: courseError } = await supabase
          .from('course_performance_metrics')
          .select('*')
          .order('enrolled_users', { ascending: false });

        if (courseError) {
          console.warn('Erro ao buscar performance de cursos:', courseError);
        }

        // Buscar contagens gerais
        const { count: totalCourses } = await supabase
          .from('learning_courses')
          .select('*', { count: 'exact', head: true })
          .eq('published', true);

        const { count: totalLessons } = await supabase
          .from('learning_lessons')
          .select('*', { count: 'exact', head: true })
          .eq('published', true);

        // Processar dados
        const totalEnrollments = courseData?.reduce((sum, item) => sum + item.enrolled_users, 0) || 0;
        const averageProgress = courseData?.length > 0 
          ? Math.round(courseData.reduce((sum, item) => sum + item.avg_progress_percentage, 0) / courseData.length)
          : 0;

        // Distribuição de progresso baseada nos dados reais
        const progressRanges = [
          { name: '0-25%', value: 0 },
          { name: '26-50%', value: 0 },
          { name: '51-75%', value: 0 },
          { name: '76-100%', value: 0 }
        ];

        courseData?.forEach(course => {
          const progress = course.avg_progress_percentage;
          if (progress <= 25) progressRanges[0].value += course.enrolled_users;
          else if (progress <= 50) progressRanges[1].value += course.enrolled_users;
          else if (progress <= 75) progressRanges[2].value += course.enrolled_users;
          else progressRanges[3].value += course.enrolled_users;
        });

        const processedData: LmsAnalyticsData = {
          totalCourses: totalCourses || 0,
          totalLessons: totalLessons || 0,
          totalEnrollments,
          averageProgress,
          coursePerformance: courseData?.map(item => ({
            courseName: item.course_title,
            enrolled: item.enrolled_users,
            avgProgress: item.avg_progress_percentage,
            completions: Math.round(item.enrolled_users * (item.avg_progress_percentage / 100))
          })) || [],
          progressDistribution: progressRanges.filter(range => range.value > 0)
        };

        setData(processedData);

      } catch (error: any) {
        console.error('Erro ao carregar analytics de LMS:', error);
        setError(error.message || 'Erro ao carregar dados de aprendizado');
        showError("Erro ao carregar dados de aprendizado", "Não foi possível carregar os dados. Verifique sua conexão.");
      } finally {
        setLoading(false);
      }
    };

    fetchLmsAnalytics();
  }, [timeRange, showError]);

  return { data, loading, error };
};
