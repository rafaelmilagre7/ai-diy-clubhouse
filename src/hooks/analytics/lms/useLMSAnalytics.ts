import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { LmsAnalyticsData } from './types';

export const useLMSAnalytics = (dateRange?: { from: Date; to: Date }) => {
  const dateKey = dateRange ? `${dateRange.from.toISOString()}-${dateRange.to.toISOString()}` : 'all';
  
  return useQuery({
    queryKey: ['lms-analytics', dateKey],
    queryFn: async (): Promise<LmsAnalyticsData> => {
      try {
        // Construir filtro de data
        let query = supabase.from('nps_analytics_view').select('*');
        
        if (dateRange?.from && dateRange?.to) {
          query = query
            .gte('created_at', dateRange.from.toISOString())
            .lte('created_at', dateRange.to.toISOString());
        }

        const { data: npsViewData, error: viewError } = await query.order('created_at', { ascending: false });

        if (viewError) {
          console.error('Erro ao buscar dados da view NPS:', viewError);
          throw viewError;
        }

        if (!npsViewData || npsViewData.length === 0) {
          console.warn('Nenhum dado encontrado na view NPS');
          return {
            npsData: {
              overall: 0,
              distribution: { promoters: 0, neutrals: 0, detractors: 0 },
              perLesson: []
            },
            statsData: {
              totalStudents: 0,
              totalLessons: 0,
              completionRate: 0,
              npsScore: 0
            },
            feedbackData: []
          };
        }

        // Processar dados NPS
        const responses = npsViewData;
        const totalResponses = responses.length;
        
        const promoters = responses.filter(r => r.score >= 9).length;
        const passives = responses.filter(r => r.score >= 7 && r.score <= 8).length;
        const detractors = responses.filter(r => r.score <= 6).length;
        
        const npsScore = totalResponses > 0 
          ? Math.round(((promoters - detractors) / totalResponses) * 100)
          : 0;

        // Buscar estatísticas gerais
        const [studentsResult, lessonsResult] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('learning_lessons').select('*', { count: 'exact', head: true }).eq('published', true)
        ]);

        // Mapear dados de feedback
        const feedbackData = responses.map(r => ({
          id: r.id,
          lessonId: r.lesson_id,
          lessonTitle: r.lesson_title || 'Aula sem título',
          score: r.score,
          feedback: r.feedback,
          createdAt: r.created_at,
          userName: r.user_name || 'Usuário',
          userEmail: r.user_email || '',
          moduleTitle: r.module_title || 'Módulo sem título',
          courseTitle: r.course_title || 'Curso sem título'
        }));

        // Agrupar por aula para calcular NPS por aula
        const lessonScores = responses.reduce((acc, response) => {
          const lessonId = response.lesson_id;
          
          if (!acc[lessonId]) {
            acc[lessonId] = {
              lessonId,
              lessonTitle: response.lesson_title || 'Aula sem título',
              courseTitle: response.course_title || 'Curso sem título',
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
            totalStudents: studentsResult.count || 0,
            totalLessons: lessonsResult.count || 0,
            completionRate: 85, // Placeholder - pode ser calculado depois
            npsScore
          },
          feedbackData
        };
      } catch (error) {
        console.error('Erro ao buscar analytics do LMS:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 10 * 60 * 1000, // 10 minutos
    retry: 3,
    retryDelay: 1000
  });
};