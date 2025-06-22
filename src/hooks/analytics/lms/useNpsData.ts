
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LmsNpsData, LmsFeedbackData, LessonNpsResponse } from './types';

export const useNpsData = (startDate: string | null) => {
  return useQuery({
    queryKey: ['lms-nps-data', startDate],
    queryFn: async (): Promise<{ npsData: LmsNpsData; feedbackData: LmsFeedbackData[] }> => {
      console.log('🎯 [NPS] Buscando dados reais de NPS do LMS');
      
      // Buscar avaliações NPS das aulas com dados dos cursos
      let npsQuery = supabase
        .from('learning_lesson_nps')
        .select(`
          id,
          lesson_id,
          score,
          feedback,
          created_at,
          user_id,
          learning_lessons!inner(title),
          profiles!inner(name)
        `);
      
      // Aplicar filtro de data se fornecido
      if (startDate) {
        npsQuery = npsQuery.gte('created_at', startDate);
      }
      
      const { data: npsResponses, error: npsError } = await npsQuery;
      
      if (npsError) {
        console.error('❌ Erro ao buscar dados de NPS:', npsError);
        throw npsError;
      }

      const responses = (npsResponses as LessonNpsResponse[]) || [];
      
      // Se não há dados, retornar estruturas vazias
      if (responses.length === 0) {
        console.log('📊 Nenhum dado de NPS encontrado');
        return {
          npsData: {
            overall: 0,
            distribution: { promoters: 0, neutrals: 0, detractors: 0 },
            perLesson: []
          },
          feedbackData: []
        };
      }

      // Calcular NPS geral
      const promoters = responses.filter(r => r.score >= 9).length;
      const detractors = responses.filter(r => r.score <= 6).length;
      const neutrals = responses.length - promoters - detractors;
      const overall = responses.length > 0 ? ((promoters - detractors) / responses.length) * 100 : 0;

      // Agrupar por aula para calcular NPS por aula
      const lessonGroups = responses.reduce((acc, response) => {
        const lessonId = response.lesson_id;
        if (!acc[lessonId]) {
          acc[lessonId] = {
            lessonId,
            lessonTitle: response.learning_lessons?.title || 'Aula sem título',
            responses: []
          };
        }
        acc[lessonId].responses.push(response);
        return acc;
      }, {} as Record<string, { lessonId: string; lessonTitle: string; responses: LessonNpsResponse[] }>);

      // Calcular NPS por aula
      const perLesson = Object.values(lessonGroups).map(group => {
        const lessonPromotors = group.responses.filter(r => r.score >= 9).length;
        const lessonDetractors = group.responses.filter(r => r.score <= 6).length;
        const npsScore = group.responses.length > 0 
          ? ((lessonPromotors - lessonDetractors) / group.responses.length) * 100 
          : 0;

        return {
          lessonId: group.lessonId,
          lessonTitle: group.lessonTitle,
          npsScore: Math.round(npsScore),
          responseCount: group.responses.length
        };
      }).sort((a, b) => b.npsScore - a.npsScore);

      // Preparar dados de feedback
      const feedbackData: LmsFeedbackData[] = responses
        .filter(r => r.feedback && r.feedback.trim().length > 0)
        .map(response => ({
          id: response.id,
          lessonId: response.lesson_id,
          lessonTitle: response.learning_lessons?.title || 'Aula sem título',
          score: response.score,
          feedback: response.feedback,
          createdAt: response.created_at,
          userName: response.profiles?.name || 'Usuário anônimo'
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      console.log(`✅ Dados de NPS carregados: ${responses.length} avaliações, NPS geral: ${Math.round(overall)}`);

      return {
        npsData: {
          overall: Math.round(overall),
          distribution: { promoters, neutrals, detractors },
          perLesson
        },
        feedbackData
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });
};
