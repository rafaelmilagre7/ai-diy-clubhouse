
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { LessonNpsResponse, LmsNpsData, LmsFeedbackData } from './types';
import { useLogging } from '@/hooks/useLogging';

// Função auxiliar para extrair título da aula com segurança
const extractLessonTitle = (item: LessonNpsResponse): string => {
  if (!item.learning_lessons) return 'Aula sem título';
  return item.learning_lessons.title || 'Aula sem título';
};

// Função auxiliar para extrair nome do usuário com segurança
const extractUserName = (item: LessonNpsResponse): string => {
  if (!item.profiles) return 'Aluno anônimo';
  return item.profiles.name || 'Aluno anônimo';
};

// Hook para buscar e processar dados de NPS
export const useNpsData = (startDate: string | null) => {
  const { log, logWarning, logError } = useLogging();

  return useQuery({
    queryKey: ['lms-nps-data', startDate],
    queryFn: async (): Promise<{
      npsData: LmsNpsData;
      feedbackData: LmsFeedbackData[];
    }> => {
      log('Buscando dados de NPS', { startDate });
      
      try {
        // Buscar dados de NPS do Supabase com LEFT JOINs
        let query = supabase
          .from('learning_lesson_nps')
          .select(`
            id,
            lesson_id,
            score,
            feedback,
            created_at,
            user_id,
            learning_lessons:lesson_id (title),
            profiles:user_id (name)
          `)
          .order('created_at', { ascending: false });
          
        // Aplicar filtro de data se necessário
        if (startDate) {
          query = query.gte('created_at', startDate);
        }
        
        const { data, error } = await query;
        
        if (error) {
          // Log do erro sem interromper a execução
          logWarning('Erro ao buscar dados de NPS:', { error: error.message, critical: false });
          
          // Retornar dados padrão em caso de erro
          return {
            npsData: {
              overall: 0,
              distribution: { promoters: 0, neutrals: 0, detractors: 0 },
              perLesson: []
            },
            feedbackData: []
          };
        }
        
        log(`Dados de NPS recuperados: ${data?.length || 0} respostas encontradas`);
        
        // Processar os dados para o formato necessário, com tratamento para valores nulos
        const npsResponses = (data || []).map(item => {
          const response = item as unknown as LessonNpsResponse;
          return {
            id: response.id,
            lessonId: response.lesson_id,
            lessonTitle: extractLessonTitle(response),
            score: response.score,
            feedback: response.feedback,
            createdAt: response.created_at,
            userId: response.user_id,
            userName: extractUserName(response)
          };
        });
        
        // Verificar se temos dados suficientes
        if (npsResponses.length === 0) {
          log('Nenhum dado de NPS encontrado para o período selecionado');
          return {
            npsData: {
              overall: 0,
              distribution: { promoters: 0, neutrals: 0, detractors: 0 },
              perLesson: []
            },
            feedbackData: []
          };
        }
        
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
      } catch (error: any) {
        // Log do erro crítico com tratamento para não interromper a aplicação
        logWarning('Erro ao processar dados de NPS:', { 
          error: error.message, 
          stack: error.stack,
          critical: false // Marcar como não crítico para evitar toast
        });
        
        // Retornar dados padrão em caso de erro
        return {
          npsData: {
            overall: 0,
            distribution: { promoters: 0, neutrals: 0, detractors: 0 },
            perLesson: []
          },
          feedbackData: []
        };
      }
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
      
      // Evitar divisão por zero
      if (total === 0) return {
        lessonId: lesson.lessonId,
        lessonTitle: lesson.lessonTitle,
        npsScore: 0,
        responseCount: 0
      };
      
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
