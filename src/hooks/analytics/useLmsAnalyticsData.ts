
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useState, useMemo } from 'react';

interface LmsAnalyticsData {
  npsData: {
    overall: number;
    distribution: {
      promoters: number;
      neutrals: number;
      detractors: number;
    };
    perLesson: Array<{
      lessonId: string;
      lessonTitle: string;
      courseTitle?: string;
      npsScore: number;
      responseCount: number;
    }>;
  };
  statsData: {
    totalStudents: number;
    totalLessons: number;
    completionRate: number;
    npsScore: number;
  };
  feedbackData: Array<{
    id: string;
    lessonId: string;
    lessonTitle: string;
    score: number;
    feedback: string | null;
    createdAt: string;
    userName: string;
  }>;
}

// Interfaces para as respostas do Supabase
interface LessonNpsResponse {
  id: string;
  lesson_id: string;
  score: number;
  feedback: string | null;
  created_at: string;
  user_id: string;
  learning_lessons?: { 
    title: string;
  } | null;
  profiles?: { 
    name: string;
  } | null;
}

export const useLmsAnalyticsData = (timeRange: string) => {
  const [startDate, setStartDate] = useState<string | null>(null);
  
  // Definir a data de início com base no timeRange
  useMemo(() => {
    if (timeRange === 'all') {
      setStartDate(null);
      return;
    }
    
    const days = parseInt(timeRange);
    const now = new Date();
    const date = new Date(now);
    date.setDate(now.getDate() - days);
    setStartDate(date.toISOString());
  }, [timeRange]);

  // Buscar dados de NPS
  const { data: npsData, isLoading: isLoadingNps } = useQuery({
    queryKey: ['lms-nps-data', timeRange],
    queryFn: async () => {
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
        console.error('Erro ao buscar dados de NPS:', error);
        throw error;
      }
      
      // Processar os dados para o formato necessário
      const npsResponses = (data as LessonNpsResponse[]).map(item => ({
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
      
      // Calcular NPS por aula
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
      
      const perLessonNps = Array.from(lessonMap.values()).map(lesson => {
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
      }).sort((a, b) => b.responseCount - a.responseCount);
      
      return {
        overall: npsScore,
        distribution: {
          promoters: Math.round(promotersPercent),
          neutrals: Math.round(neutralsPercent),
          detractors: Math.round(detractorsPercent)
        },
        perLesson: perLessonNps,
        feedbackData: npsResponses
          .filter(response => response.feedback)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      };
    }
  });
  
  // Buscar estatísticas gerais
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['lms-stats-data', timeRange],
    queryFn: async () => {
      // Buscar contagem de usuários únicos com progresso
      const { count: studentsCount, error: studentsError } = await supabase
        .from('learning_progress')
        .select('user_id', { count: 'exact', head: true })
        .gte('progress_percentage', 1);
      
      if (studentsError) {
        console.error('Erro ao buscar contagem de alunos:', studentsError);
      }
      
      // Buscar total de aulas
      const { count: lessonsCount, error: lessonsError } = await supabase
        .from('learning_lessons')
        .select('*', { count: 'exact', head: true })
        .eq('published', true);
        
      if (lessonsError) {
        console.error('Erro ao buscar contagem de aulas:', lessonsError);
      }
      
      // Buscar taxa de conclusão
      const { data: progress, error: progressError } = await supabase
        .from('learning_progress')
        .select('progress_percentage');
      
      if (progressError) {
        console.error('Erro ao buscar progresso:', progressError);
      }
      
      // Calcular taxa média de conclusão
      const completedLessons = progress?.filter(p => p.progress_percentage >= 100)?.length || 0;
      const totalLessonsProgress = progress?.length || 1; // Evitar divisão por zero
      const completionRate = Math.round((completedLessons / totalLessonsProgress) * 100);
      
      return {
        totalStudents: studentsCount || 0,
        totalLessons: lessonsCount || 0,
        completionRate: completionRate,
        // Usando o NPS calculado anteriormente
        npsScore: npsData?.overall || 0
      };
    },
    enabled: !!npsData
  });
  
  return {
    npsData: {
      overall: npsData?.overall || 0,
      distribution: npsData?.distribution || { promoters: 0, neutrals: 0, detractors: 0 },
      perLesson: npsData?.perLesson || []
    },
    statsData: statsData || {
      totalStudents: 0,
      totalLessons: 0,
      completionRate: 0,
      npsScore: 0
    },
    feedbackData: npsData?.feedbackData || [],
    isLoading: isLoadingNps || isLoadingStats
  };
};
