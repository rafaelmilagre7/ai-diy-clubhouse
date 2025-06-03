
import { useCallback, useEffect } from 'react';
import { useSyncMonitor } from './useSyncMonitor';
import { useCacheMonitor } from './useCacheMonitor';
import { useAuth } from '@/contexts/auth';
import { useLogging } from '@/hooks/useLogging';

export const useProgressMonitor = () => {
  const { user } = useAuth();
  const { reportSyncIssue } = useSyncMonitor();
  const { learningUtils } = useCacheMonitor();
  const { log } = useLogging();

  // Monitorar progresso de lição
  const trackLessonProgress = useCallback((
    lessonId: string,
    newProgress: number,
    previousProgress?: number
  ) => {
    // Verificar se o progresso faz sentido
    if (newProgress < 0 || newProgress > 100) {
      reportSyncIssue(
        'conflict',
        'LessonProgress',
        `Progresso inválido: ${newProgress}%`,
        { lessonId, newProgress, previousProgress },
        'high'
      );
      return;
    }

    // Verificar se o progresso regrediu sem motivo
    if (previousProgress && newProgress < previousProgress - 5) {
      reportSyncIssue(
        'conflict',
        'LessonProgress',
        `Progresso regrediu: ${previousProgress}% → ${newProgress}%`,
        { lessonId, newProgress, previousProgress },
        'medium'
      );
    }

    // Rastrear no cache
    learningUtils.trackProgress(lessonId, user?.id || '', newProgress);

    log('Progress tracked', {
      lessonId,
      newProgress,
      previousProgress,
      user_id: user?.id
    });
  }, [reportSyncIssue, learningUtils, user?.id, log]);

  // Monitorar tentativas de atualização de progresso
  const trackProgressUpdate = useCallback((
    lessonId: string,
    operation: 'start' | 'update' | 'complete' | 'error',
    data?: any
  ) => {
    const operationData = {
      lessonId,
      operation,
      timestamp: Date.now(),
      user_id: user?.id,
      ...data
    };

    switch (operation) {
      case 'start':
        log('Progress update started', operationData);
        break;
      case 'update':
        log('Progress update in progress', operationData);
        break;
      case 'complete':
        log('Progress update completed', operationData);
        break;
      case 'error':
        reportSyncIssue(
          'sync_delay',
          'LessonProgress',
          `Erro ao atualizar progresso: ${data?.error}`,
          operationData,
          'high'
        );
        break;
    }
  }, [reportSyncIssue, log, user?.id]);

  // Monitorar conflitos de progresso
  const detectProgressConflict = useCallback((
    lessonId: string,
    localProgress: number,
    serverProgress: number
  ) => {
    const difference = Math.abs(localProgress - serverProgress);
    
    if (difference > 10) { // Diferença maior que 10%
      reportSyncIssue(
        'conflict',
        'LessonProgress',
        `Conflito de progresso detectado: Local ${localProgress}% vs Server ${serverProgress}%`,
        { lessonId, localProgress, serverProgress, difference },
        difference > 25 ? 'high' : 'medium'
      );

      return true;
    }

    return false;
  }, [reportSyncIssue]);

  // Monitorar progresso de vídeo específico
  const trackVideoProgress = useCallback((
    lessonId: string,
    videoId: string,
    currentTime: number,
    duration: number
  ) => {
    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
    
    // Verificar se os valores fazem sentido
    if (currentTime < 0 || currentTime > duration || duration <= 0) {
      reportSyncIssue(
        'conflict',
        'VideoProgress',
        `Valores de vídeo inválidos: ${currentTime}/${duration}`,
        { lessonId, videoId, currentTime, duration },
        'medium'
      );
      return;
    }

    log('Video progress tracked', {
      lessonId,
      videoId,
      currentTime,
      duration,
      progressPercentage,
      user_id: user?.id
    });
  }, [reportSyncIssue, log, user?.id]);

  return {
    trackLessonProgress,
    trackProgressUpdate,
    detectProgressConflict,
    trackVideoProgress,
    
    // Utilitários específicos
    utils: {
      // Verificar se o progresso está sendo sincronizado corretamente
      validateProgressSync: (lessonId: string, localData: any, serverData: any) => {
        const issues = [];
        
        if (localData?.progress_percentage !== serverData?.progress_percentage) {
          issues.push('progress_mismatch');
        }
        
        if (localData?.last_position_seconds !== serverData?.last_position_seconds) {
          issues.push('position_mismatch');
        }
        
        if (issues.length > 0) {
          reportSyncIssue(
            'conflict',
            'LessonProgress',
            `Dados de progresso dessincronizados: ${issues.join(', ')}`,
            { lessonId, localData, serverData, issues },
            'medium'
          );
        }
        
        return issues.length === 0;
      }
    }
  };
};
