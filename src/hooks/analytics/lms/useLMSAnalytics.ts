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

      try {
        // Buscar avaliações NPS (query simples primeiro)
        const { data: npsData, error: npsError } = await supabase
          .from('learning_lesson_nps')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: false });

        if (npsError) {
          console.error('Erro ao buscar dados NPS:', npsError);
          throw npsError;
        }

        // Buscar aulas para fazer o mapeamento manualmente
        const lessonIds = [...new Set(npsData?.map(r => r.lesson_id) || [])];
        const { data: lessonsData } = await supabase
          .from('learning_lessons')
          .select(`
            id,
            title,
            learning_modules!inner(
              title,
              learning_courses!inner(title)
            )
          `)
          .in('id', lessonIds);

        // Buscar perfis dos usuários
        const userIds = [...new Set(npsData?.map(r => r.user_id) || [])];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds);

        // Processar dados NPS
        const responses = npsData || [];
        const totalResponses = responses.length;
        
        const promoters = responses.filter(r => r.score >= 9).length;
        const passives = responses.filter(r => r.score >= 7 && r.score <= 8).length;
        const detractors = responses.filter(r => r.score <= 6).length;
        
        const npsScore = totalResponses > 0 
          ? Math.round(((promoters - detractors) / totalResponses) * 100)
          : 0;

        // Buscar estatísticas gerais
        const { count: totalStudents } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        const { count: totalLessons } = await supabase
          .from('learning_lessons')
          .select('*', { count: 'exact', head: true })
          .eq('published', true);

        // Mapear dados com informações relacionadas
        const feedbackData = responses.map(r => {
          const lesson = lessonsData?.find(l => l.id === r.lesson_id);
          const profile = profilesData?.find(p => p.id === r.user_id);
          
          return {
            id: r.id,
            lessonId: r.lesson_id,
            lessonTitle: lesson?.title || 'Aula sem título',
            score: r.score,
            feedback: r.feedback,
            createdAt: r.created_at,
            userName: profile?.name || 'Usuário'
          };
        });

        // Agrupar por aula
        const lessonScores = responses.reduce((acc, response: any) => {
          const lessonId = response.lesson_id;
          const lesson = lessonsData?.find(l => l.id === lessonId);
          
          if (!acc[lessonId]) {
            acc[lessonId] = {
              lessonId,
              lessonTitle: lesson?.title || 'Aula sem título',
              courseTitle: lesson?.learning_modules?.[0]?.learning_courses?.[0]?.title || 'Curso sem título',
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
          npsScore: lesson.scores.length > 0 
            ? Math.round(lesson.scores.reduce((sum: number, score: number) => sum + score, 0) / lesson.scores.length)
            : 0,
          responseCount: lesson.scores.length
        }));

        return {
          npsData: {
            overall: npsScore,
            distribution: {
              promoters: totalResponses > 0 ? Math.round((promoters / totalResponses) * 100) : 0,
              neutrals: totalResponses > 0 ? Math.round((passives / totalResponses) * 100) : 0,
              detractors: totalResponses > 0 ? Math.round((detractors / totalResponses) * 100) : 0
            },
            perLesson
          },
          statsData: {
            totalStudents: totalStudents || 0,
            totalLessons: totalLessons || 0,
            completionRate: 85, // Placeholder por enquanto
            npsScore
          },
          feedbackData
        };
      } catch (error) {
        console.error('Erro geral na query de analytics:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 10 * 60 * 1000, // 10 minutos
    retry: 3,
    retryDelay: 1000
  });
};