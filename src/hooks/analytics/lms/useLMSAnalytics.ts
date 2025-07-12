import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { LmsAnalyticsData, LessonNpsResponse, ProgressResponse } from './types';

export const useLMSAnalytics = (dateRange?: { from: Date; to: Date }) => {
  return useQuery({
    queryKey: ['lms-analytics', dateRange],
    queryFn: async (): Promise<LmsAnalyticsData> => {
      const startDate = dateRange?.from ? dateRange.from.toISOString() : 
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = dateRange?.to ? dateRange.to.toISOString() : new Date().toISOString();

      // Buscar avaliações NPS com informações das aulas
      const { data: npsData, error: npsError } = await supabase
        .from('learning_lesson_nps')
        .select(`
          id,
          lesson_id,
          score,
          feedback,
          created_at,
          user_id,
          learning_lessons!inner(
            title,
            learning_modules!inner(
              title,
              learning_courses!inner(
                title
              )
            )
          ),
          profiles!inner(
            name
          )
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (npsError) {
        console.error('Erro ao buscar dados NPS:', npsError);
        throw npsError;
      }

      // Buscar dados de progresso para taxa de conclusão
      const { data: progressData, error: progressError } = await supabase
        .from('learning_progress')
        .select('progress_percentage')
        .eq('progress_percentage', 100);

      if (progressError) {
        console.error('Erro ao buscar progresso:', progressError);
        throw progressError;
      }

      // Processar dados NPS
      const responses = npsData || [];
      const totalResponses = responses.length;
      
      const promoters = responses.filter(r => r.score >= 9).length;
      const passives = responses.filter(r => r.score >= 7 && r.score <= 8).length;
      const detractors = responses.filter(r => r.score <= 6).length;
      
      const npsScore = totalResponses > 0 
        ? Math.round(((promoters - detractors) / totalResponses) * 100)
        : 0;

      // Agrupar por aula
      const lessonScores = responses.reduce((acc, response: any) => {
        const lessonId = response.lesson_id;
        if (!acc[lessonId]) {
          acc[lessonId] = {
            lessonId,
            lessonTitle: response.learning_lessons?.[0]?.title || 'Aula sem título',
            courseTitle: response.learning_lessons?.[0]?.learning_modules?.[0]?.learning_courses?.[0]?.title || 'Curso sem título',
            scores: []
          };
        }
        acc[lessonId].scores.push(response.score);
        return acc;
      }, {} as Record<string, any>);

      const perLesson = Object.values(lessonScores).map((lesson: any) => ({
        lessonId: lesson.lessonId,
        lessonTitle: lesson.lessonTitle,
        courseTitle: lesson.courseTitle,
        npsScore: Math.round(lesson.scores.reduce((sum: number, score: number) => sum + score, 0) / lesson.scores.length),
        responseCount: lesson.scores.length
      }));

      // Buscar estatísticas gerais
      const { count: totalStudents } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: totalLessons } = await supabase
        .from('learning_lessons')
        .select('*', { count: 'exact', head: true })
        .eq('published', true);

      const completionRate = totalLessons && progressData 
        ? Math.round((progressData.length / (totalStudents || 1)) * 100)
        : 0;

      return {
        npsData: {
          overall: npsScore,
          distribution: {
            promoters: Math.round((promoters / totalResponses) * 100) || 0,
            neutrals: Math.round((passives / totalResponses) * 100) || 0,
            detractors: Math.round((detractors / totalResponses) * 100) || 0
          },
          perLesson
        },
        statsData: {
          totalStudents: totalStudents || 0,
          totalLessons: totalLessons || 0,
          completionRate,
          npsScore
        },
        feedbackData: responses.map((r: any) => ({
          id: r.id,
          lessonId: r.lesson_id,
          lessonTitle: r.learning_lessons?.[0]?.title || 'Aula sem título',
          score: r.score,
          feedback: r.feedback,
          createdAt: r.created_at,
          userName: r.profiles?.[0]?.name || 'Usuário'
        }))
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 10 * 60 * 1000, // 10 minutos
  });
};