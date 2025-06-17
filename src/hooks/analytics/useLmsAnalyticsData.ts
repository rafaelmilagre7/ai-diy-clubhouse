
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface LmsAnalyticsData {
  totalCourses: number;
  totalStudents: number;
  averageCompletionTime: number;
  completionRate: number;
  courseProgress: Array<{ name: string; completed: number; total: number }>;
  npsScores: Array<{ lesson: string; score: number; responses: number }>;
}

export const useLmsAnalyticsData = (timeRange: string) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LmsAnalyticsData>({
    totalCourses: 0,
    totalStudents: 0,
    averageCompletionTime: 0,
    completionRate: 0,
    courseProgress: [],
    npsScores: []
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLmsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar cursos publicados
        const { data: coursesData, error: coursesError } = await supabase
          .from('learning_courses')
          .select('id, title')
          .eq('published', true);

        if (coursesError) throw coursesError;

        // Buscar progresso dos estudantes
        const { data: progressData, error: progressError } = await supabase
          .from('learning_progress')
          .select(`
            id,
            user_id,
            lesson_id,
            progress_percentage,
            completed_at,
            started_at,
            learning_lessons!inner(
              id,
              title,
              learning_modules!inner(
                id,
                course_id,
                learning_courses!inner(
                  id,
                  title
                )
              )
            )
          `);

        if (progressError) throw progressError;

        // Buscar scores NPS
        const { data: npsData, error: npsError } = await supabase
          .from('learning_lesson_nps')
          .select(`
            score,
            lesson_id,
            learning_lessons!inner(
              title
            )
          `);

        if (npsError) throw npsError;

        // Calcular métricas
        const totalCourses = coursesData?.length || 0;
        const uniqueStudents = new Set(progressData?.map(p => p.user_id)).size;
        
        // Calcular tempo médio de conclusão
        const completedProgress = progressData?.filter(p => p.completed_at && p.started_at) || [];
        const averageCompletionTime = completedProgress.length > 0 
          ? completedProgress.reduce((acc, p) => {
              const startTime = new Date(p.started_at).getTime();
              const endTime = new Date(p.completed_at!).getTime();
              return acc + (endTime - startTime) / (1000 * 60); // em minutos
            }, 0) / completedProgress.length
          : 0;

        // Calcular taxa de conclusão
        const totalProgress = progressData?.length || 0;
        const completedCount = progressData?.filter(p => p.progress_percentage === 100).length || 0;
        const completionRate = totalProgress > 0 ? (completedCount / totalProgress) * 100 : 0;

        // Processar progresso por curso
        const courseProgress = coursesData?.map(course => {
          const courseProgressData = progressData?.filter(p => {
            // Corrigir o acesso às propriedades aninhadas
            const lessonData = p.learning_lessons;
            if (!lessonData || !lessonData.learning_modules) return false;
            
            const moduleData = lessonData.learning_modules;
            if (!moduleData || !moduleData.learning_courses) return false;
            
            const courseData = moduleData.learning_courses;
            return courseData.id === course.id;
          }) || [];

          const completed = courseProgressData.filter(p => p.progress_percentage === 100).length;
          const total = courseProgressData.length;

          return {
            name: course.title,
            completed,
            total
          };
        }) || [];

        // Processar scores NPS
        const npsScores = npsData?.reduce((acc, nps) => {
          const lessonData = nps.learning_lessons;
          const lessonTitle = lessonData?.title || 'Aula sem título';
          
          const existing = acc.find(item => item.lesson === lessonTitle);
          if (existing) {
            existing.score = (existing.score * existing.responses + nps.score) / (existing.responses + 1);
            existing.responses++;
          } else {
            acc.push({
              lesson: lessonTitle,
              score: nps.score,
              responses: 1
            });
          }
          return acc;
        }, [] as Array<{ lesson: string; score: number; responses: number }>) || [];

        setData({
          totalCourses,
          totalStudents: uniqueStudents,
          averageCompletionTime: Math.round(averageCompletionTime),
          completionRate: Math.round(completionRate),
          courseProgress,
          npsScores
        });

      } catch (err: any) {
        console.error('Erro ao buscar dados do LMS:', err);
        setError(err.message || 'Erro ao carregar dados do LMS');
        toast({
          title: "Erro ao carregar dados do LMS",
          description: "Não foi possível carregar os dados do sistema de aprendizagem.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLmsData();
  }, [timeRange, toast]);

  return { data, loading, error };
};
