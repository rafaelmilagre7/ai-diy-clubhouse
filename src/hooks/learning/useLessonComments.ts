
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { useLogging } from '@/hooks/useLogging';
import { Comment } from '@/types/learningTypes';
import { useOptimizedLessonComments } from './useOptimizedLessonComments';
import { useCommentSync } from './useCommentSync';
import { useSyncMonitor } from '@/hooks/monitoring/useSyncMonitor';
import { useOfflinePersistence } from './useOfflinePersistence';
import { toast } from 'sonner';

export const useLessonComments = (lessonId: string) => {
  const { user } = useAuth();
  const { log, logError } = useLogging();
  const { reportSyncIssue } = useSyncMonitor();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Hooks otimizados integrados
  const {
    fetchComments,
    addOptimisticComment,
    confirmOptimisticComment,
    removeOptimisticComment,
    performSmartSync,
    queryKey,
    hasOptimisticComments
  } = useOptimizedLessonComments(lessonId);
  
  const { queueOperation, forceSyncAll, pendingOperationsCount } = useCommentSync(lessonId);
  const { loadFromStorage, getPersistedCount } = useOfflinePersistence(lessonId);
  
  // Query principal com configuração otimizada
  const { 
    data: comments = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey,
    queryFn: fetchComments,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (era cacheTime)
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Monitorar erros com useEffect (substitui onError do v4)
  useEffect(() => {
    if (error) {
      logError('Erro ao carregar comentários', { 
        error, 
        lessonId,
        showToast: false // Não mostrar toast para erros de carregamento
      });
      
      reportSyncIssue(
        'cache_miss',
        'LessonComments',
        `Erro ao carregar comentários: ${error.message}`,
        { error, lessonId },
        'high'
      );
    }
  }, [error, logError, lessonId, reportSyncIssue]);

  // Restaurar operações offline ao montar
  useEffect(() => {
    const persistedOps = loadFromStorage();
    if (persistedOps.length > 0) {
      log('Operações offline detectadas', {
        count: persistedOps.length,
        lessonId
      });
      
      toast.info('Operações offline detectadas', {
        description: `${persistedOps.length} operações serão sincronizadas`,
        duration: 3000
      });
      
      // Tentar sincronizar automaticamente
      setTimeout(() => {
        forceSyncAll();
      }, 1000);
    }
  }, [loadFromStorage, forceSyncAll, log, lessonId]);

  // Adicionar comentário com sistema robusto
  const addComment = async (content: string, parentId: string | null = null) => {
    if (!user) {
      toast.error('Você precisa estar logado para comentar');
      return;
    }
    
    if (!content.trim()) {
      toast.error('O comentário não pode estar vazio');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. Adicionar comentário otimista imediatamente
      const optimisticComment = addOptimisticComment(content.trim(), parentId || undefined);
      
      if (!optimisticComment) {
        throw new Error('Falha ao criar comentário otimista');
      }
      
      // 2. Adicionar à fila de sincronização
      const operationId = queueOperation({
        type: 'add',
        data: { content: content.trim(), parentId }
      });
      
      // 3. Simular confirmação após delay (em produção, viria do servidor)
      setTimeout(() => {
        const confirmedComment: Comment = {
          ...optimisticComment,
          id: `confirmed_${Date.now()}`, // Simular ID do servidor
          created_at: new Date().toISOString()
        };
        
        confirmOptimisticComment(optimisticComment.id, confirmedComment);
      }, 1000);
      
      toast.success('Comentário adicionado com sucesso');
      
      log('Comentário adicionado com sistema robusto', { 
        lessonId, 
        hasParentId: !!parentId,
        optimisticId: optimisticComment.id,
        operationId
      });
      
    } catch (error: any) {
      // Remover comentário otimista em caso de erro
      if (error.optimisticId) {
        removeOptimisticComment(error.optimisticId);
      }
      
      logError('Erro ao adicionar comentário', { 
        error, 
        lessonId,
        showToast: true
      });
      
      reportSyncIssue(
        'sync_delay',
        'LessonComments',
        `Erro ao adicionar comentário: ${error.message}`,
        { error, lessonId },
        'high'
      );
      
      toast.error('Erro ao adicionar comentário. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Deletar comentário
  const deleteComment = async (commentId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }
    
    try {
      // Adicionar à fila de sincronização
      queueOperation({
        type: 'delete',
        data: { commentId }
      });
      
      // Atualização otimista - remover do cache local
      removeOptimisticComment(commentId);
      
      toast.success('Comentário removido');
      
      log('Comentário deletado', { commentId, lessonId });
      
    } catch (error: any) {
      logError('Erro ao deletar comentário', { 
        error, 
        commentId, 
        lessonId,
        showToast: true
      });
      
      reportSyncIssue(
        'sync_delay',
        'LessonComments',
        `Erro ao deletar comentário: ${error.message}`,
        { error, commentId, lessonId },
        'medium'
      );
      
      toast.error('Erro ao remover comentário. Tente novamente.');
    }
  };

  // Curtir/descurtir comentário
  const likeComment = async (commentId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para curtir');
      return;
    }
    
    try {
      // Encontrar comentário atual
      const findComment = (comments: Comment[]): Comment | null => {
        for (const comment of comments) {
          if (comment.id === commentId) return comment;
          if (comment.replies) {
            const found = findComment(comment.replies);
            if (found) return found;
          }
        }
        return null;
      };
      
      const currentComment = findComment(comments);
      if (!currentComment) {
        throw new Error('Comentário não encontrado');
      }
      
      const isCurrentlyLiked = currentComment.user_has_liked;
      
      // Adicionar à fila de sincronização
      queueOperation({
        type: 'like',
        data: { commentId, isLiking: !isCurrentlyLiked }
      });
      
      log('Comentário curtido/descurtido', { 
        commentId, 
        isLiking: !isCurrentlyLiked,
        lessonId
      });
      
    } catch (error: any) {
      logError('Erro ao curtir comentário', { 
        error, 
        commentId,
        showToast: true
      });
      
      reportSyncIssue(
        'sync_delay',
        'LessonComments',
        `Erro ao curtir comentário: ${error.message}`,
        { error, commentId },
        'low'
      );
      
      toast.error('Erro ao curtir comentário. Tente novamente.');
    }
  };

  // Forçar sincronização com monitoramento
  const forceSync = async () => {
    try {
      log('Forçando sincronização robusta', { lessonId });
      
      // Sincronizar operações pendentes
      await forceSyncAll();
      
      // Sincronização inteligente
      await performSmartSync();
      
      toast.success('Comentários sincronizados com sucesso');
      
    } catch (error: any) {
      logError('Erro na sincronização forçada', { error, lessonId });
      
      reportSyncIssue(
        'sync_delay',
        'LessonComments',
        `Erro na sincronização: ${error.message}`,
        { error, lessonId },
        'high'
      );
      
      toast.error('Erro ao sincronizar comentários');
    }
  };

  return {
    comments,
    isLoading,
    error,
    addComment,
    deleteComment,
    likeComment,
    isSubmitting: isSubmitting || hasOptimisticComments,
    forceSync,
    refetch,
    
    // Informações de sincronização
    syncStatus: {
      pendingOperations: pendingOperationsCount,
      persistedOperations: getPersistedCount(),
      hasOptimisticComments
    }
  };
};
