
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { LessonNpsResponse, LmsNpsData, LmsFeedbackData } from './types';
import { useLogging } from '@/hooks/useLogging';

// Hook para buscar e processar dados de NPS
export const useNpsData = (startDate: string | null) => {
  const { log, logError } = useLogging();

  return useQuery({
    queryKey: ['lms-nps-data', startDate],
    queryFn: async (): Promise<{
      npsData: LmsNpsData;
      feedbackData: LmsFeedbackData[];
    }> => {
      log('Buscando dados de NPS', { startDate });
      
      // Buscar dados de NPS do Supabase
      const query = supabase
        .from('learning_lesson_nps')
        .select(`
          id,
          lesson_id,
          score,
          feedback,
          created_at,
          user_id,
          learning_lessons(title),
          profiles:user_id(name)
        `);
        
      // Aplicar filtro de data se necessário
      if (startDate) {
        query.gte('created_at', startDate);
      }
      
      const { data, error } = await query;
      
      if (error) {
        logError('Erro ao buscar dados de NPS:', error);
        throw error;
      }
      
      log(`Dados de NPS recuperados: ${data?.length || 0} respostas encontradas`);
      
      // Processar os dados para o formato necessário
      const npsResponses = (data as unknown as LessonNpsResponse[] || []).map(item => ({
        id: item.id,
        lessonId: item.lesson_id,
        lessonTitle: item.learning_lessons?.title || 'Aula sem título',
        score: item.score,
        feedback: item.feedback,
        createdAt: item.created_at,
        userId: item.user_id,
        userName: item.profiles?.name || 'Aluno anônimo'
      }));
      
      // Calcular métricas de NPS
      const promoters = npsResponses.filter(r => r.score >= 9).length;
      const neutrals = npsResponses.filter(r => r.score >= 7 && r.score <= 8).length;
      const detractors = npsResponses.filter(r => r.score <= 6).length;
      const total = npsResponses.length || 1; // Evitar divisão por zero
      
      // Calcular percentuais
      const promotersPercent = (promoters / total) * 100;
      const neutralsPercent = (neutrals / total) * 100;
      const detractorsPercent = (detractors / total) * 100;
      
      // Calcular score NPS (promoters% - detractors%)
      const npsScore = Math.round(promotersPercent - detractorsPercent);
      
      log('Métricas de NPS calculadas', { 
        total, 
        promoters, 
        neutrals, 
        detractors,
        npsScore
      });
      
      // Calcular NPS por aula
      const perLessonNps = processLessonNpsData(npsResponses);
      
      const feedbackData = npsResponses
        .filter(response => response.feedback)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      return {
        npsData: {
          overall: npsScore,
          distribution: {
            promoters: Math.round(promotersPercent),
            neutrals: Math.round(neutralsPercent),
            detractors: Math.round(detractorsPercent)
          },
          perLesson: perLessonNps
        },
        feedbackData
      };
    }
  });
};

// Função auxiliar para processar os dados de NPS por aula
function processLessonNpsData(npsResponses: {
  lessonId: string;
  lessonTitle: string;
  score: number;
}[]): Array<{
  lessonId: string;
  lessonTitle: string;
  npsScore: number;
  responseCount: number;
}> {
  const lessonMap = new Map();
  
  npsResponses.forEach(response => {
    if (!lessonMap.has(response.lessonId)) {
      lessonMap.set(response.lessonId, {
        lessonId: response.lessonId,
        lessonTitle: response.lessonTitle,
        scores: [],
        responseCount: 0
      });
    }
    
    const lessonData = lessonMap.get(response.lessonId);
    lessonData.scores.push(response.score);
    lessonData.responseCount++;
  });
  
  return Array.from(lessonMap.values())
    .map(lesson => {
      const promoters = lesson.scores.filter(score => score >= 9).length;
      const detractors = lesson.scores.filter(score => score <= 6).length;
      const total = lesson.scores.length;
      const npsScore = Math.round((promoters / total) * 100) - Math.round((detractors / total) * 100);
      
      return {
        lessonId: lesson.lessonId,
        lessonTitle: lesson.lessonTitle,
        npsScore: npsScore,
        responseCount: lesson.responseCount
      };
    })
    .sort((a, b) => b.responseCount - a.responseCount);
}
