
import { useCallback, useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useLogging } from '@/hooks/useLogging';
import { useOfflinePersistence } from './useOfflinePersistence';
import { useSyncMonitor } from '@/hooks/monitoring/useSyncMonitor';
import { useConflictDetection } from './useConflictDetection';
import { Comment } from '@/types/learningTypes';
import { toast } from 'sonner';

interface OptimisticComment extends Comment {
  isOptimistic?: boolean;
  isSending?: boolean;
}

export const useOptimizedLessonComments = (lessonId: string) => {
  const { user, profile } = useAuth();
  const { log, logError } = useLogging();
  const queryClient = useQueryClient();
  
  // Estados locais
  const [optimisticComments, setOptimisticComments] = useState<OptimisticComment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const optimisticCounterRef = useRef(0);
  
  // Hooks especializados
  const { 
    persistOperation, 
    removePersistedOperation, 
    loadFromStorage 
  } = useOfflinePersistence(lessonId);
  
  const { reportSyncIssue } = useSyncMonitor();
  const { detectConflict, autoResolveConflict, validateDataIntegrity } = useConflictDetection();
  
  const queryKey = ['learning-comments', lessonId];

  // Buscar comentários do servidor
  const fetchComments = useCallback(async (): Promise<Comment[]> => {
    try {
      log('Buscando comentários do servidor', { lessonId });
      
      const { data, error } = await supabase
        .from('learning_comments')
        .select(`
          id,
          content,
          created_at,
          updated_at,
          user_id,
          lesson_id,
          parent_id,
          likes_count,
          profiles!learning_comments_user_id_fkey (
            id,
            name,
            email,
            avatar_url,
            role
          )
        `)
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: false });

      if (error) {
        logError('Erro ao buscar comentários', { error, lessonId });
        throw error;
      }

      const comments = (data || []).map(comment => ({
        ...comment,
        user_has_liked: false, // Será atualizado por query separada se necessário
        replies: []
      }));

      // Validar integridade dos dados
      if (!validateDataIntegrity(comments)) {
        reportSyncIssue('stale_data', 'fetchComments', 'Dados inconsistentes retornados do servidor', { lessonId }, 'medium');
      }

      log('Comentários carregados com sucesso', { 
        count: comments.length,
        lessonId 
      });

      return comments;
    } catch (error) {
      logError('Falha ao buscar comentários', { error, lessonId });
      reportSyncIssue('cache_miss', 'fetchComments', 'Falha na busca de comentários', { error }, 'high');
      throw error;
    }
  }, [lessonId, log, logError, validateDataIntegrity, reportSyncIssue]);

  // Query principal otimizada
  const {
    data: serverComments = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: fetchComments,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (failureCount >= 2) {
        reportSyncIssue('cache_miss', 'useQuery', 'Múltiplas falhas na query', { error, failureCount }, 'high');
        return false;
      }
      return true;
    }
  });

  // Adicionar comentário otimista
  const addOptimisticComment = useCallback((content: string, parentId?: string) => {
    if (!user || !profile) {
      logError('Usuário não autenticado para comentário otimista', { lessonId });
      return null;
    }

    const optimisticId = `optimistic-${++optimisticCounterRef.current}-${Date.now()}`;
    const optimisticComment: OptimisticComment = {
      id: optimisticId,
      content: content.trim(),
      user_id: user.id,
      lesson_id: lessonId,
      parent_id: parentId || null,
      created_at: new Date().toISOString(),
      likes_count: 0,
      user_has_liked: false,
      profiles: {
        id: user.id,
        name: profile.name || 'Você',
        email: profile.email || '',
        avatar_url: profile.avatar_url || '',
        role: profile.role || 'member'
      },
      replies: [],
      isOptimistic: true,
      isSending: true
    };

    setOptimisticComments(prev => [optimisticComment, ...prev]);

    // Persistir para sincronização posterior
    persistOperation({
      type: 'add_comment',
      data: { content, parentId },
      lessonId
    });

    log('Comentário otimista adicionado', { 
      optimisticId, 
      lessonId,
      hasParent: !!parentId 
    });
    
    return optimisticComment;
  }, [user, profile, lessonId, persistOperation, log, logError]);

  // Confirmar comentário otimista
  const confirmOptimisticComment = useCallback((optimisticId: string, realComment: Comment) => {
    setOptimisticComments(prev => 
      prev.filter(comment => comment.id !== optimisticId)
    );
    
    // Invalidar cache para buscar dados atualizados
    queryClient.invalidateQueries({ queryKey });
    
    log('Comentário confirmado pelo servidor', { 
      optimisticId, 
      realId: realComment.id,
      lessonId 
    });
  }, [queryClient, queryKey, log, lessonId]);

  // Remover comentário otimista em caso de erro
  const removeOptimisticComment = useCallback((optimisticId: string) => {
    setOptimisticComments(prev => 
      prev.filter(comment => comment.id !== optimisticId)
    );
    
    toast.error('Erro ao enviar comentário. Tente novamente.');
    log('Comentário otimista removido por erro', { optimisticId, lessonId });
  }, [log, lessonId]);

  // Sincronização inteligente
  const performSmartSync = useCallback(async () => {
    try {
      log('Iniciando sincronização inteligente', { lessonId });
      
      // Processar operações pendentes
      const pendingOps = loadFromStorage();
      
      for (const operation of pendingOps) {
        try {
          if (operation.type === 'add_comment') {
            const { content, parentId } = operation.data;
            
            const { data, error } = await supabase
              .from('learning_comments')
              .insert({
                content,
                lesson_id: lessonId,
                parent_id: parentId || null,
                user_id: user?.id
              })
              .select()
              .single();

            if (error) throw error;

            // Remover da persistência após sucesso
            removePersistedOperation(operation.id);
            
            log('Operação pendente sincronizada', { 
              operationId: operation.id,
              commentId: data.id 
            });
          }
        } catch (error) {
          logError('Erro ao sincronizar operação', { 
            error, 
            operationId: operation.id 
          });
        }
      }

      // Forçar atualização dos dados
      await refetch();
      
      log('Sincronização inteligente concluída', { lessonId });
      
    } catch (error) {
      logError('Erro na sincronização inteligente', { error, lessonId });
      reportSyncIssue('sync_delay', 'performSmartSync', 'Falha na sincronização', { error }, 'high');
    }
  }, [lessonId, loadFromStorage, removePersistedOperation, user?.id, refetch, log, logError, reportSyncIssue]);

  // Adicionar comentário com otimização
  const addComment = useCallback(async (content: string, parentId?: string | null) => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Adicionar otimisticamente
      const optimisticComment = addOptimisticComment(content, parentId || undefined);
      
      if (!optimisticComment) {
        throw new Error('Não foi possível criar comentário otimista');
      }

      // Tentar enviar para o servidor
      const { data, error } = await supabase
        .from('learning_comments')
        .insert({
          content: content.trim(),
          lesson_id: lessonId,
          parent_id: parentId,
          user_id: user?.id
        })
        .select(`
          id,
          content,
          created_at,
          updated_at,
          user_id,
          lesson_id,
          parent_id,
          likes_count,
          profiles!learning_comments_user_id_fkey (
            id,
            name,
            email,
            avatar_url,
            role
          )
        `)
        .single();

      if (error) {
        removeOptimisticComment(optimisticComment.id);
        throw error;
      }

      // Confirmar comentário otimista
      confirmOptimisticComment(optimisticComment.id, data as Comment);
      
      toast.success('Comentário adicionado com sucesso!');
      
    } catch (error) {
      logError('Erro ao adicionar comentário', { error, lessonId });
      toast.error('Erro ao adicionar comentário. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }, [lessonId, user?.id, addOptimisticComment, removeOptimisticComment, confirmOptimisticComment, log, logError]);

  // Deletar comentário
  const deleteComment = useCallback(async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('learning_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey });
      toast.success('Comentário excluído com sucesso!');
      
    } catch (error) {
      logError('Erro ao excluir comentário', { error, commentId });
      toast.error('Erro ao excluir comentário.');
    }
  }, [queryClient, queryKey, logError]);

  // Curtir comentário
  const likeComment = useCallback(async (commentId: string) => {
    try {
      // Implementação simplificada - pode ser expandida
      queryClient.invalidateQueries({ queryKey });
      
    } catch (error) {
      logError('Erro ao curtir comentário', { error, commentId });
      toast.error('Erro ao curtir comentário.');
    }
  }, [queryClient, queryKey, logError]);

  // Combinar comentários do servidor com otimistas
  const allComments = [...optimisticComments, ...serverComments];

  // Verificar se há comentários otimistas
  const hasOptimisticComments = optimisticComments.length > 0;

  // Forçar sincronização
  const forceSync = useCallback(async () => {
    await performSmartSync();
  }, [performSmartSync]);

  return {
    comments: allComments,
    isLoading,
    error,
    isSubmitting,
    addComment,
    deleteComment,
    likeComment,
    forceSync,
    hasOptimisticComments,
    
    // Funções avançadas
    addOptimisticComment,
    confirmOptimisticComment,
    removeOptimisticComment,
    performSmartSync
  };
};
