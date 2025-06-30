
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

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
  progressDistribution: Array<{ name: string; value: number }>;
}

const defaultData: LmsAnalyticsData = {
  totalCourses: 0,
  totalLessons: 0,
  totalEnrollments: 0,
  averageProgress: 0,
  coursePerformance: [],
  progressDistribution: []
};

export const useLmsAnalyticsData = (timeRange: string) => {
  const { toast } = useToast();
  const [data, setData] = useState<LmsAnalyticsData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLmsAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados da view de analytics de aprendizado
      const { data: learningData, error: learningError } = await supabase
        .from('learning_analytics_data')
        .select('*');

      if (learningError) {
        throw new Error('Erro ao carregar dados de aprendizado');
      }

      // Buscar estatísticas gerais
      const [coursesResult, lessonsResult, progressResult] = await Promise.all([
        supabase.from('learning_courses').select('*', { count: 'exact', head: true }).eq('published', true),
        supabase.from('learning_lessons').select('*', { count: 'exact', head: true }).eq('published', true),
        supabase.from('learning_progress').select('progress_percentage')
      ]);

      const totalCourses = coursesResult.count || 0;
      const totalLessons = lessonsResult.count || 0;
      
      // Calcular métricas de progresso
      const progressData = progressResult.data || [];
      const totalEnrollments = progressData.length;
      const averageProgress = totalEnrollments > 0 ? 
        Math.round(progressData.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / totalEnrollments) : 0;

      // Processar performance dos cursos
      const coursePerformance = (learningData || []).map(course => ({
        courseName: course.course_title,
        enrolled: course.enrolled_users,
        avgProgress: course.avg_progress_percentage,
        completions: Math.round((course.enrolled_users * course.avg_progress_percentage) / 100)
      }));

      // Distribuição de progresso
      const progressRanges = [
        { name: '0-25%', min: 0, max: 25 },
        { name: '26-50%', min: 26, max: 50 },
        { name: '51-75%', min: 51, max: 75 },
        { name: '76-100%', min: 76, max: 100 }
      ];

      const progressDistribution = progressRanges.map(range => ({
        name: range.name,
        value: progressData.filter(p => 
          p.progress_percentage >= range.min && p.progress_percentage <= range.max
        ).length
      }));

      setData({
        totalCourses,
        totalLessons,
        totalEnrollments,
        averageProgress,
        coursePerformance,
        progressDistribution
      });

    } catch (error: any) {
      console.error('Erro ao carregar analytics LMS:', error);
      setError(error.message || 'Erro ao carregar dados de aprendizado');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchLmsAnalytics();
  }, [fetchLmsAnalytics]);

  return { data, loading, error, refresh: fetchLmsAnalytics };
};
