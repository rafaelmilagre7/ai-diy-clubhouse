
import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLessonComments } from './useLessonComments';
import { useOfflinePersistence } from './useOfflinePersistence';
import { useConflictDetection } from './useConflictDetection';
import { useSyncMonitor } from '@/hooks/monitoring/useSyncMonitor';
import { useCacheMonitor } from '@/hooks/monitoring/useCacheMonitor';
import { useLogging } from '@/hooks/useLogging';
import { Comment } from '@/types/learningTypes';

export const useOptimizedLessonComments = (lessonId: string) => {
  const { log, logError } = useLogging();
  const queryClient = useQueryClient();
  
  // Hooks de monitoramento e persistência
  const { reportSyncIssue } = useSyncMonitor();
  const { trackCacheAccess } = useCacheMonitor();
  const { persistOperation, removePersistedOperation } = useOfflinePersistence(lessonId);
  const { detectBatchConflicts, validateDataIntegrity } = useConflictDetection();
  
  // Hook principal de comentários
  const {
    comments: baseComments,
    isLoading,
    addComment: baseAddComment,
    deleteComment: baseDeleteComment,
    likeComment: baseLikeComment,
    isSubmitting,
    error,
    forceSync
  } = useLessonComments(lessonId);

  // Validar e processar comentários com detecção de conflitos
  const comments = useMemo(() => {
    if (!baseComments) return [];
    
    // Validar integridade dos dados
    const isValid = validateDataIntegrity(baseComments);
    if (!isValid) {
      reportSyncIssue(
        'stale_data',
        'useOptimizedLessonComments',
        'Dados de comentários com integridade comprometida',
        { lessonId, commentsCount: baseComments.length },
        'high'
      );
    }
    
    // Rastrear acesso ao cache
    trackCacheAccess(['learning-comments', lessonId], 'OptimizedLessonComments', baseComments);
    
    return baseComments;
  }, [baseComments, validateDataIntegrity, reportSyncIssue, trackCacheAccess, lessonId]);

  // Função otimizada para adicionar comentário
  const addComment = useCallback(async (content: string, parentId: string | null = null) => {
    const operationId = `add_comment_${Date.now()}`;
    
    try {
      // Persistir operação para recovery offline
      const persistentId = persistOperation({
        type: 'add_comment',
        data: { content, parentId },
        lessonId
      });
      
      log('Iniciando adição de comentário otimizada', { 
        lessonId, 
        hasParentId: !!parentId,
        operationId,
        persistentId
      });
      
      // Executar operação
      await baseAddComment(content, parentId);
      
      // Remover da persistência após sucesso
      removePersistedOperation(persistentId);
      
      log('Comentário adicionado com sucesso', { 
        lessonId, 
        operationId 
      });
      
    } catch (error) {
      logError('Erro ao adicionar comentário otimizado', { 
        lessonId, 
        operationId, 
        error: error instanceof Error ? error.message : String(error)
      });
      
      reportSyncIssue(
        'sync_delay',
        'OptimizedLessonComments',
        `Falha ao adicionar comentário: ${error}`,
        { lessonId, operationId, content },
        'high'
      );
      
      throw error;
    }
  }, [baseAddComment, persistOperation, removePersistedOperation, lessonId, log, logError, reportSyncIssue]);

  // Função otimizada para deletar comentário
  const deleteComment = useCallback(async (commentId: string) => {
    const operationId = `delete_comment_${Date.now()}`;
    
    try {
      // Persistir operação para recovery offline
      const persistentId = persistOperation({
        type: 'delete_comment',
        data: { commentId },
        lessonId
      });
      
      log('Iniciando deleção de comentário otimizada', { 
        lessonId, 
        commentId,
        operationId,
        persistentId
      });
      
      // Executar operação
      await baseDeleteComment(commentId);
      
      // Remover da persistência após sucesso
      removePersistedOperation(persistentId);
      
      log('Comentário deletado com sucesso', { 
        lessonId, 
        commentId,
        operationId 
      });
      
    } catch (error) {
      logError('Erro ao deletar comentário otimizado', { 
        lessonId, 
        commentId,
        operationId, 
        error: error instanceof Error ? error.message : String(error)
      });
      
      reportSyncIssue(
        'sync_delay',
        'OptimizedLessonComments',
        `Falha ao deletar comentário: ${error}`,
        { lessonId, commentId, operationId },
        'high'
      );
      
      throw error;
    }
  }, [baseDeleteComment, persistOperation, removePersistedOperation, lessonId, log, logError, reportSyncIssue]);

  // Função otimizada para curtir comentário
  const likeComment = useCallback(async (commentId: string) => {
    const operationId = `like_comment_${Date.now()}`;
    
    try {
      // Persistir operação para recovery offline
      const persistentId = persistOperation({
        type: 'like_comment',
        data: { commentId },
        lessonId
      });
      
      log('Iniciando curtida de comentário otimizada', { 
        lessonId, 
        commentId,
        operationId,
        persistentId
      });
      
      // Executar operação
      await baseLikeComment(commentId);
      
      // Remover da persistência após sucesso
      removePersistedOperation(persistentId);
      
      log('Comentário curtido com sucesso', { 
        lessonId, 
        commentId,
        operationId 
      });
      
    } catch (error) {
      logError('Erro ao curtir comentário otimizado', { 
        lessonId, 
        commentId,
        operationId, 
        error: error instanceof Error ? error.message : String(error)
      });
      
      reportSyncIssue(
        'sync_delay',
        'OptimizedLessonComments',
        `Falha ao curtir comentário: ${error}`,
        { lessonId, commentId, operationId },
        'medium'
      );
      
      throw error;
    }
  }, [baseLikeComment, persistOperation, removePersistedOperation, lessonId, log, logError, reportSyncIssue]);

  // Função de sincronização forçada com monitoramento
  const optimizedForceSync = useCallback(async () => {
    const start = Date.now();
    
    try {
      log('Iniciando sincronização forçada otimizada', { lessonId });
      
      await forceSync();
      
      const duration = Date.now() - start;
      log('Sincronização forçada concluída', { lessonId, duration });
      
      if (duration > 3000) {
        reportSyncIssue(
          'sync_delay',
          'OptimizedLessonComments',
          `Sincronização lenta: ${duration}ms`,
          { lessonId, duration },
          'medium'
        );
      }
      
    } catch (error) {
      const duration = Date.now() - start;
      logError('Erro na sincronização forçada otimizada', { 
        lessonId, 
        duration,
        error: error instanceof Error ? error.message : String(error)
      });
      
      reportSyncIssue(
        'sync_delay',
        'OptimizedLessonComments',
        `Falha na sincronização: ${error}`,
        { lessonId, duration },
        'high'
      );
      
      throw error;
    }
  }, [forceSync, lessonId, log, logError, reportSyncIssue]);

  return {
    comments,
    isLoading,
    addComment,
    deleteComment,
    likeComment,
    isSubmitting,
    error,
    forceSync: optimizedForceSync,
    
    // Métricas de monitoramento
    metrics: {
      commentsCount: comments?.length || 0,
      hasError: !!error,
      isOnline: !error // Simplified online detection
    }
  };
};
