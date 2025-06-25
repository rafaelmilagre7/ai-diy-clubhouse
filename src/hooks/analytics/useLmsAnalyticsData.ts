
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

// Definir tipos mais específicos para os dados do Supabase
interface ProgressDataItem {
  id: string;
  user_id: string;
  lesson_id: string;
  progress_percentage: number;
  completed_at: string | null;
  started_at: string | null;
  learning_lessons: {
    id: string;
    title: string;
    learning_modules: {
      id: string;
      course_id: string;
      learning_courses: {
        id: string;
        title: string;
      };
    };
  } | null;
}

interface NpsDataItem {
  score: number;
  lesson_id: string;
  learning_lessons: {
    title: string;
  } | null;
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
          .eq('published', true as any);

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
            learning_lessons(
              id,
              title,
              learning_modules(
                id,
                course_id,
                learning_courses(
                  id,
                  title
                )
              )
            )
          `) as { data: ProgressDataItem[] | null; error: any };

        if (progressError) throw progressError;

        // Buscar scores NPS
        const { data: npsData, error: npsError } = await supabase
          .from('learning_lesson_nps')
          .select(`
            score,
            lesson_id,
            learning_lessons(
              title
            )
          `) as { data: NpsDataItem[] | null; error: any };

        if (npsError) throw npsError;

        // Calcular métricas
        const totalCourses = (coursesData as any)?.length || 0;
        const uniqueStudents = new Set((progressData as any)?.map((p: any) => p.user_id)).size;
        
        // Calcular tempo médio de conclusão
        const completedProgress = (progressData as any)?.filter((p: any) => p.completed_at && p.started_at) || [];
        const averageCompletionTime = completedProgress.length > 0 
          ? completedProgress.reduce((acc: number, p: any) => {
              const startTime = new Date(p.started_at!).getTime();
              const endTime = new Date(p.completed_at!).getTime();
              return acc + (endTime - startTime) / (1000 * 60); // em minutos
            }, 0) / completedProgress.length
          : 0;

        // Calcular taxa de conclusão
        const totalProgress = (progressData as any)?.length || 0;
        const completedCount = (progressData as any)?.filter((p: any) => p.progress_percentage === 100).length || 0;
        const completionRate = totalProgress > 0 ? (completedCount / totalProgress) * 100 : 0;

        // Processar progresso por curso
        const courseProgress = (coursesData as any)?.map((course: any) => {
          const courseProgressData = (progressData as any)?.filter((p: any) => {
            // Corrigir o acesso às propriedades aninhadas
            const lessonData = p.learning_lessons;
            if (!lessonData?.learning_modules) return false;
            
            const moduleData = lessonData.learning_modules;
            if (!moduleData?.learning_courses) return false;
            
            const courseData = moduleData.learning_courses;
            return courseData && (courseData as any).id === (course as any).id;
          }) || [];

          const completed = courseProgressData.filter((p: any) => p.progress_percentage === 100).length;
          const total = courseProgressData.length;

          return {
            name: (course as any).title,
            completed,
            total
          };
        }) || [];

        // Processar scores NPS
        const npsScores = (npsData as any)?.reduce((acc: any, nps: any) => {
          const lessonData = nps.learning_lessons;
          const lessonTitle = lessonData?.title || 'Aula sem título';
          
          const existing = acc.find((item: any) => item.lesson === lessonTitle);
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
