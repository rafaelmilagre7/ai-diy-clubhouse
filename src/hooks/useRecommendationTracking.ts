import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';

export interface RecommendationEvent {
  recommendation_id: string;
  lesson_id?: string;
  lesson_ids?: string[];
  event_type: 'viewed' | 'clicked' | 'started' | 'completed' | 'feedback';
  click_position?: number;
  feedback_score?: number;
  feedback_text?: string;
  metadata?: Record<string, any>;
}

export const useRecommendationTracking = () => {
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);

  /**
   * Registra visualização de recomendações
   */
  const trackRecommendationView = async (
    recommendationId: string, 
    lessonIds: string[],
    metadata?: Record<string, any>
  ) => {
    if (!user?.id) return;

    try {
      await supabase.from('recommendation_analytics').insert({
        user_id: user.id,
        recommendation_id: recommendationId,
        lesson_ids: lessonIds,
        event_type: 'viewed',
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        }
      });

      console.log('📊 [TRACKING] Visualização de recomendação registrada:', {
        recommendationId,
        lessonCount: lessonIds.length
      });
    } catch (error) {
      console.error('❌ [TRACKING] Erro ao registrar visualização:', error);
    }
  };

  /**
   * Registra clique em aula recomendada
   */
  const trackLessonClick = async (
    lessonId: string, 
    position: number,
    recommendationId?: string,
    metadata?: Record<string, any>
  ) => {
    if (!user?.id) return;

    try {
      setIsTracking(true);

      await supabase.from('recommendation_analytics').insert({
        user_id: user.id,
        recommendation_id: recommendationId || 'unknown',
        lesson_id: lessonId,
        event_type: 'clicked',
        click_position: position,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          source_page: window.location.pathname
        }
      });

      console.log('🎯 [TRACKING] Clique em aula registrado:', {
        lessonId,
        position,
        recommendationId
      });
    } catch (error) {
      console.error('❌ [TRACKING] Erro ao registrar clique:', error);
    } finally {
      setIsTracking(false);
    }
  };

  /**
   * Registra início de aula
   */
  const trackLessonStart = async (
    lessonId: string,
    recommendationId?: string,
    metadata?: Record<string, any>
  ) => {
    if (!user?.id) return;

    try {
      await supabase.from('recommendation_analytics').insert({
        user_id: user.id,
        recommendation_id: recommendationId || 'unknown',
        lesson_id: lessonId,
        event_type: 'started',
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          device_type: /Mobile|Android|iP(hone|od|ad)|BlackBerry|IEMobile/.test(navigator.userAgent) ? 'mobile' : 'desktop'
        }
      });

      console.log('🚀 [TRACKING] Início de aula registrado:', {
        lessonId,
        recommendationId
      });
    } catch (error) {
      console.error('❌ [TRACKING] Erro ao registrar início:', error);
    }
  };

  /**
   * Registra conclusão de aula
   */
  const trackLessonCompletion = async (
    lessonId: string,
    recommendationId?: string,
    completionTimeSeconds?: number,
    metadata?: Record<string, any>
  ) => {
    if (!user?.id) return;

    try {
      await supabase.from('recommendation_analytics').insert({
        user_id: user.id,
        recommendation_id: recommendationId || 'unknown',
        lesson_id: lessonId,
        event_type: 'completed',
        metadata: {
          ...metadata,
          completion_time_seconds: completionTimeSeconds,
          timestamp: new Date().toISOString()
        }
      });

      console.log('✅ [TRACKING] Conclusão de aula registrada:', {
        lessonId,
        recommendationId,
        completionTimeSeconds
      });
    } catch (error) {
      console.error('❌ [TRACKING] Erro ao registrar conclusão:', error);
    }
  };

  /**
   * Registra feedback sobre recomendações
   */
  const trackRecommendationFeedback = async (
    recommendationId: string,
    feedbackScore: number,
    feedbackText?: string,
    lessonId?: string,
    metadata?: Record<string, any>
  ) => {
    if (!user?.id) return;

    try {
      await supabase.from('recommendation_analytics').insert({
        user_id: user.id,
        recommendation_id: recommendationId,
        lesson_id: lessonId,
        event_type: 'feedback',
        feedback_score: feedbackScore,
        feedback_text: feedbackText,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString()
        }
      });

      toast({
        title: "Feedback registrado",
        description: "Obrigado! Seu feedback nos ajuda a melhorar as recomendações.",
      });

      console.log('💭 [TRACKING] Feedback registrado:', {
        recommendationId,
        feedbackScore,
        lessonId
      });
    } catch (error) {
      console.error('❌ [TRACKING] Erro ao registrar feedback:', error);
      toast({
        title: "Erro ao enviar feedback",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  };

  /**
   * Busca métricas de eficácia das recomendações
   */
  const getRecommendationMetrics = async (recommendationId?: string) => {
    if (!user?.id) return null;

    try {
      let query = supabase
        .from('recommendation_analytics')
        .select('*')
        .eq('user_id', user.id);

      if (recommendationId) {
        query = query.eq('recommendation_id', recommendationId);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      // Calcular métricas
      const metrics = {
        total_views: data?.filter(d => d.event_type === 'viewed').length || 0,
        total_clicks: data?.filter(d => d.event_type === 'clicked').length || 0,
        total_starts: data?.filter(d => d.event_type === 'started').length || 0,
        total_completions: data?.filter(d => d.event_type === 'completed').length || 0,
        click_through_rate: 0,
        completion_rate: 0,
        avg_feedback_score: 0
      };

      if (metrics.total_views > 0) {
        metrics.click_through_rate = (metrics.total_clicks / metrics.total_views) * 100;
      }

      if (metrics.total_starts > 0) {
        metrics.completion_rate = (metrics.total_completions / metrics.total_starts) * 100;
      }

      const feedbackScores = data
        ?.filter(d => d.event_type === 'feedback' && d.feedback_score)
        .map(d => d.feedback_score) || [];

      if (feedbackScores.length > 0) {
        metrics.avg_feedback_score = feedbackScores.reduce((acc, score) => acc + score, 0) / feedbackScores.length;
      }

      return metrics;
    } catch (error) {
      console.error('❌ [TRACKING] Erro ao buscar métricas:', error);
      return null;
    }
  };

  return {
    trackRecommendationView,
    trackLessonClick,
    trackLessonStart,
    trackLessonCompletion,
    trackRecommendationFeedback,
    getRecommendationMetrics,
    isTracking
  };
};