
import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useLogging } from '@/hooks/useLogging';
import { Comment } from '@/types/learningTypes';
import { useConflictDetection } from './useConflictDetection';
import { useOfflinePersistence } from './useOfflinePersistence';

export const useOptimizedLessonComments = (lessonId: string) => {
  const { user } = useAuth();
  const { log, logError } = useLogging();
  const queryClient = useQueryClient();
  const optimisticCommentsRef = useRef<Map<string, Comment>>(new Map());
  
  const queryKey = ['learning-comments', lessonId];
  const { detectBatchConflicts, validateDataIntegrity } = useConflictDetection();
  const { persistOperation, removePersistedOperation } = useOfflinePersistence(lessonId);

  // Buscar comentários do servidor
  const fetchComments = useCallback(async (): Promise<Comment[]> => {
    try {
      const { data, error } = await supabase
        .from('learning_comments')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            email,
            avatar_url,
            role
          )
        `)
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const comments = data || [];
      
      // Validar integridade dos dados
      if (!validateDataIntegrity(comments)) {
        throw new Error('Dados de comentários com estrutura inválida');
      }

      // Organizar em hierarquia (comentários principais e respostas)
      const commentsMap = new Map(comments.map(c => [c.id, { ...c, replies: [] as Comment[] }]));
      const rootComments: Comment[] = [];

      comments.forEach(comment => {
        const commentWithReplies = commentsMap.get(comment.id)!;
        
        if (comment.parent_id) {
          const parent = commentsMap.get(comment.parent_id);
          if (parent) {
            parent.replies!.push(commentWithReplies);
          }
        } else {
          rootComments.push(commentWithReplies);
        }
      });

      log('Comentários carregados e organizados', {
        lessonId,
        totalComments: comments.length,
        rootComments: rootComments.length
      });

      return rootComments;
    } catch (error) {
      logError('Erro ao buscar comentários', { error, lessonId });
      throw error;
    }
  }, [lessonId, log, logError, validateDataIntegrity]);

  // Adicionar comentário otimista
  const addOptimisticComment = useCallback((content: string, parentId?: string): Comment | null => {
    if (!user) return null;

    const optimisticComment: Comment = {
      id: `optimistic_${Date.now()}_${Math.random()}`,
      content,
      created_at: new Date().toISOString(),
      user_id: user.id,
      lesson_id: lessonId,
      parent_id: parentId || null,
      profiles: {
        id: user.id,
        name: user.user_metadata?.full_name || user.email || 'Usuário',
        email: user.email || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        role: 'member'
      },
      likes_count: 0,
      user_has_liked: false,
      replies: []
    };

    // Adicionar ao mapa de comentários otimistas
    optimisticCommentsRef.current.set(optimisticComment.id, optimisticComment);

    // Persistir para offline
    persistOperation({
      type: 'add_optimistic',
      data: optimisticComment
    });

    // Atualizar cache imediatamente
    queryClient.setQueryData(queryKey, (oldData: Comment[] | undefined) => {
      if (!oldData) return [optimisticComment];
      
      if (parentId) {
        // Adicionar como resposta
        return oldData.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), optimisticComment]
            };
          }
          return comment;
        });
      } else {
        // Adicionar como comentário principal
        return [...oldData, optimisticComment];
      }
    });

    log('Comentário otimista adicionado', {
      optimisticId: optimisticComment.id,
      lessonId,
      hasParent: !!parentId
    });

    return optimisticComment;
  }, [user, lessonId, queryClient, queryKey, persistOperation, log]);

  // Confirmar comentário otimista com dados do servidor
  const confirmOptimisticComment = useCallback((optimisticId: string, serverComment: Comment) => {
    // Remover do mapa otimista
    optimisticCommentsRef.current.delete(optimisticId);
    
    // Remover da persistência
    removePersistedOperation(optimisticId);

    // Substituir no cache
    queryClient.setQueryData(queryKey, (oldData: Comment[] | undefined) => {
      if (!oldData) return [serverComment];
      
      const replaceComment = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === optimisticId) {
            return serverComment;
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: replaceComment(comment.replies)
            };
          }
          return comment;
        });
      };
      
      return replaceComment(oldData);
    });

    log('Comentário otimista confirmado', {
      optimisticId,
      serverId: serverComment.id,
      lessonId
    });
  }, [queryClient, queryKey, removePersistedOperation, log]);

  // Remover comentário otimista
  const removeOptimisticComment = useCallback((optimisticId: string) => {
    optimisticCommentsRef.current.delete(optimisticId);
    removePersistedOperation(optimisticId);

    queryClient.setQueryData(queryKey, (oldData: Comment[] | undefined) => {
      if (!oldData) return [];
      
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

    log('Comentário otimista removido', { optimisticId, lessonId });
  }, [queryClient, queryKey, removePersistedOperation, log]);

  // Sincronização inteligente
  const performSmartSync = useCallback(async () => {
    try {
      log('Iniciando sincronização inteligente', { lessonId });
      
      // Buscar dados mais recentes do servidor
      const serverComments = await fetchComments();
      const currentCache = queryClient.getQueryData<Comment[]>(queryKey) || [];
      
      // Detectar conflitos
      const conflicts = detectBatchConflicts(currentCache, serverComments);
      
      if (conflicts.length > 0) {
        log('Conflitos detectados durante sync', {
          lessonId,
          conflictCount: conflicts.length
        });
        // Aqui poderíamos mostrar uma UI para resolver conflitos
      }
      
      // Atualizar cache com dados do servidor
      queryClient.setQueryData(queryKey, serverComments);
      
      log('Sincronização inteligente concluída', { lessonId });
    } catch (error) {
      logError('Erro na sincronização inteligente', { error, lessonId });
      throw error;
    }
  }, [fetchComments, queryClient, queryKey, detectBatchConflicts, log, logError, lessonId]);

  return {
    fetchComments,
    addOptimisticComment,
    confirmOptimisticComment,
    removeOptimisticComment,
    performSmartSync,
    queryKey,
    
    // Estado
    hasOptimisticComments: optimisticCommentsRef.current.size > 0
  };
};
