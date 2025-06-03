
import { useCallback, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useLogging } from '@/hooks/useLogging';
import { Comment } from '@/types/learningTypes';
import { useCacheMonitor } from '@/hooks/monitoring/useCacheMonitor';

interface OptimizedCommentsConfig {
  enablePreload?: boolean;
  enableOptimisticUpdates?: boolean;
  debounceMs?: number;
  maxRetries?: number;
}

export const useOptimizedLessonComments = (
  lessonId: string,
  config: OptimizedCommentsConfig = {}
) => {
  const {
    enablePreload = true,
    enableOptimisticUpdates = true,
    debounceMs = 300,
    maxRetries = 3
  } = config;
  
  const { user } = useAuth();
  const { log, logError } = useLogging();
  const queryClient = useQueryClient();
  const { trackCacheAccess, invalidateCache } = useCacheMonitor();
  
  const optimisticUpdatesRef = useRef<Map<string, Comment>>(new Map());
  const pendingOperationsRef = useRef<Set<string>>(new Set());
  const lastSyncRef = useRef<number>(Date.now());
  
  const queryKey = ['learning-comments', lessonId];
  
  // Rastrear acesso ao cache
  useEffect(() => {
    if (lessonId) {
      trackCacheAccess(queryKey, 'OptimizedLessonComments');
    }
  }, [lessonId, trackCacheAccess]);

  // Buscar comentários com fallback robusto
  const fetchComments = useCallback(async (): Promise<Comment[]> => {
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        log('Buscando comentários otimizado', { lessonId, attempt: retryCount + 1 });
        
        const { data, error } = await supabase
          .from('learning_comments')
          .select(`
            *,
            profiles:user_id (
              name,
              avatar_url
            ),
            likes_count:learning_comment_likes(count)
          `)
          .eq('lesson_id', lessonId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Processar dados e adicionar informações de curtidas
        const processedComments = await Promise.all(
          (data || []).map(async (comment) => {
            // Verificar se o usuário curtiu
            let userHasLiked = false;
            if (user) {
              const { data: likeData } = await supabase
                .from('learning_comment_likes')
                .select('id')
                .eq('comment_id', comment.id)
                .eq('user_id', user.id)
                .single();
              
              userHasLiked = !!likeData;
            }

            return {
              ...comment,
              likes_count: comment.likes_count?.[0]?.count || 0,
              user_has_liked: userHasLiked,
              profiles: comment.profiles || { name: 'Usuário', avatar_url: null }
            } as Comment;
          })
        );

        // Organizar comentários com respostas
        const rootComments = processedComments.filter(c => !c.parent_id);
        const commentsWithReplies = rootComments.map(comment => ({
          ...comment,
          replies: processedComments.filter(c => c.parent_id === comment.id)
        }));

        lastSyncRef.current = Date.now();
        log('Comentários carregados com sucesso', { 
          lessonId, 
          count: commentsWithReplies.length,
          totalReplies: processedComments.filter(c => c.parent_id).length
        });

        return commentsWithReplies;
      } catch (error) {
        retryCount++;
        
        if (retryCount >= maxRetries) {
          logError('Falha final ao buscar comentários', { 
            error, 
            lessonId, 
            attempts: retryCount 
          });
          throw error;
        }
        
        // Backoff exponencial
        const delay = Math.pow(2, retryCount - 1) * 1000;
        log(`Tentativa ${retryCount} falhou, tentando novamente em ${delay}ms`, { lessonId });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return [];
  }, [lessonId, user, log, logError, maxRetries]);

  // Adicionar comentário com atualizações otimistas
  const addOptimisticComment = useCallback((content: string, parentId?: string) => {
    if (!enableOptimisticUpdates || !user) return null;

    const optimisticComment: Comment = {
      id: `optimistic_${Date.now()}`,
      lesson_id: lessonId,
      user_id: user.id,
      content,
      parent_id: parentId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likes_count: 0,
      user_has_liked: false,
      profiles: {
        name: user.user_metadata?.name || 'Você',
        avatar_url: user.user_metadata?.avatar_url || null
      },
      replies: []
    };

    // Adicionar ao cache otimista
    optimisticUpdatesRef.current.set(optimisticComment.id, optimisticComment);

    // Atualizar cache do React Query
    queryClient.setQueryData(queryKey, (oldData: Comment[] = []) => {
      if (parentId) {
        // É uma resposta
        return oldData.map(comment => 
          comment.id === parentId 
            ? { ...comment, replies: [...(comment.replies || []), optimisticComment] }
            : comment
        );
      } else {
        // É um comentário principal
        return [optimisticComment, ...oldData];
      }
    });

    log('Comentário otimista adicionado', { 
      commentId: optimisticComment.id, 
      lessonId, 
      hasParent: !!parentId 
    });

    return optimisticComment;
  }, [enableOptimisticUpdates, user, lessonId, queryClient, queryKey, log]);

  // Confirmar comentário otimista
  const confirmOptimisticComment = useCallback((optimisticId: string, serverComment: Comment) => {
    optimisticUpdatesRef.current.delete(optimisticId);
    
    // Substituir no cache
    queryClient.setQueryData(queryKey, (oldData: Comment[] = []) => {
      const updateComment = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === optimisticId) {
            return serverComment;
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: updateComment(comment.replies)
            };
          }
          return comment;
        });
      };
      
      return updateComment(oldData);
    });

    log('Comentário otimista confirmado', { optimisticId, serverId: serverComment.id });
  }, [queryClient, queryKey, log]);

  // Remover comentário otimista (em caso de erro)
  const removeOptimisticComment = useCallback((optimisticId: string) => {
    optimisticUpdatesRef.current.delete(optimisticId);
    
    queryClient.setQueryData(queryKey, (oldData: Comment[] = []) => {
      const removeComment = (comments: Comment[]): Comment[] => {
        return comments
          .filter(comment => comment.id !== optimisticId)
          .map(comment => ({
            ...comment,
            replies: comment.replies ? removeComment(comment.replies) : []
          }));
      };
      
      return removeComment(oldData);
    });

    log('Comentário otimista removido', { optimisticId });
  }, [queryClient, queryKey, log]);

  // Detectar conflitos entre dados locais e servidor
  const detectConflicts = useCallback((localComments: Comment[], serverComments: Comment[]) => {
    const conflicts = [];
    
    for (const localComment of localComments) {
      const serverComment = serverComments.find(c => c.id === localComment.id);
      
      if (serverComment) {
        // Verificar diferenças significativas
        if (localComment.likes_count !== serverComment.likes_count) {
          conflicts.push({
            type: 'likes_mismatch',
            commentId: localComment.id,
            local: localComment.likes_count,
            server: serverComment.likes_count
          });
        }
        
        if (localComment.user_has_liked !== serverComment.user_has_liked) {
          conflicts.push({
            type: 'like_status_mismatch',
            commentId: localComment.id,
            local: localComment.user_has_liked,
            server: serverComment.user_has_liked
          });
        }
      }
    }
    
    if (conflicts.length > 0) {
      log('Conflitos detectados nos comentários', { conflicts, lessonId });
    }
    
    return conflicts;
  }, [log, lessonId]);

  // Sync inteligente
  const performSmartSync = useCallback(async () => {
    try {
      const currentData = queryClient.getQueryData<Comment[]>(queryKey) || [];
      const serverData = await fetchComments();
      
      // Detectar conflitos
      const conflicts = detectConflicts(currentData, serverData);
      
      if (conflicts.length > 0) {
        // Resolver conflitos priorizando dados do servidor
        log('Resolvendo conflitos, priorizando dados do servidor', { conflicts });
      }
      
      // Atualizar cache com dados do servidor
      queryClient.setQueryData(queryKey, serverData);
      
      log('Sync inteligente concluído', { 
        lessonId, 
        conflicts: conflicts.length,
        serverCount: serverData.length 
      });
      
      return serverData;
    } catch (error) {
      logError('Falha no sync inteligente', { error, lessonId });
      throw error;
    }
  }, [queryClient, queryKey, fetchComments, detectConflicts, log, logError, lessonId]);

  // Preload de comentários relacionados
  const preloadRelatedComments = useCallback(async (relatedLessonIds: string[]) => {
    if (!enablePreload) return;
    
    for (const relatedLessonId of relatedLessonIds) {
      const relatedQueryKey = ['learning-comments', relatedLessonId];
      
      // Só preload se não estiver em cache
      if (!queryClient.getQueryData(relatedQueryKey)) {
        queryClient.prefetchQuery({
          queryKey: relatedQueryKey,
          queryFn: () => fetchComments(),
          staleTime: 5 * 60 * 1000 // 5 minutos
        });
      }
    }
  }, [enablePreload, queryClient, fetchComments]);

  return {
    fetchComments,
    addOptimisticComment,
    confirmOptimisticComment,
    removeOptimisticComment,
    performSmartSync,
    detectConflicts,
    preloadRelatedComments,
    queryKey,
    
    // Estado
    lastSync: lastSyncRef.current,
    hasPendingOperations: pendingOperationsRef.current.size > 0,
    optimisticCount: optimisticUpdatesRef.current.size
  };
};
