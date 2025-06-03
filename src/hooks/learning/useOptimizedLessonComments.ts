import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useLogging } from '@/hooks/useLogging';
import { Comment } from '@/types/learningTypes';

export const useOptimizedLessonComments = (lessonId: string) => {
  const { user } = useAuth();
  const { log, logError } = useLogging();
  const queryClient = useQueryClient();
  
  const optimisticCommentsRef = useRef<Map<string, Comment>>(new Map());
  const queryKey = ['learning-comments', lessonId];

  // Buscar comentários do Supabase
  const fetchComments = useCallback(async (): Promise<Comment[]> => {
    const { data, error } = await supabase
      .from('learning_comments')
      .select(`
        id,
        content,
        created_at,
        user_id,
        lesson_id,
        parent_id,
        profiles:user_id (
          id,
          name,
          avatar_url,
          role
        )
      `)
      .eq('lesson_id', lessonId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: true });

    if (error) {
      logError('Erro ao buscar comentários', { error, lessonId });
      throw error;
    }

    // Transformar dados para incluir likes_count e user_has_liked
    const commentsWithLikes = await Promise.all(
      (data || []).map(async (comment) => {
        // Buscar contagem de likes
        const { count: likesCount } = await supabase
          .from('learning_comment_likes')
          .select('*', { count: 'exact', head: true })
          .eq('comment_id', comment.id);

        // Verificar se o usuário atual curtiu
        let userHasLiked = false;
        if (user) {
          const { data: userLike } = await supabase
            .from('learning_comment_likes')
            .select('id')
            .eq('comment_id', comment.id)
            .eq('user_id', user.id)
            .single();
          
          userHasLiked = !!userLike;
        }

        return {
          ...comment,
          likes_count: likesCount || 0,
          user_has_liked: userHasLiked,
          profiles: comment.profiles || {
            id: comment.user_id,
            name: 'Usuário',
            avatar_url: '',
            role: 'member'
          }
        };
      })
    );

    // Organizar comentários em árvore
    const commentsTree = buildCommentsTree(commentsWithLikes);
    
    log('Comentários carregados com sucesso', { 
      lessonId, 
      count: commentsWithLikes.length 
    });

    return commentsTree;
  }, [lessonId, user, log, logError]);

  // Construir árvore de comentários
  const buildCommentsTree = useCallback((comments: any[]): Comment[] => {
    const commentMap = new Map();
    const rootComments: Comment[] = [];

    // Primeiro, criar um mapa de todos os comentários
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Depois, organizar em árvore
    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id);
      
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  }, []);

  // Adicionar comentário otimista
  const addOptimisticComment = useCallback((content: string, parentId?: string): Comment | null => {
    if (!user) return null;

    const optimisticComment: Comment = {
      id: `optimistic_${Date.now()}`,
      content,
      created_at: new Date().toISOString(),
      user_id: user.id,
      lesson_id: lessonId,
      parent_id: parentId || null,
      profiles: {
        id: user.id,
        name: user.user_metadata?.name || user.email || 'Você',
        avatar_url: user.user_metadata?.avatar_url || '',
        role: 'member'
      },
      likes_count: 0,
      user_has_liked: false,
      replies: []
    };

    // Adicionar ao cache otimista
    optimisticCommentsRef.current.set(optimisticComment.id, optimisticComment);

    // Atualizar cache do React Query
    queryClient.setQueryData(queryKey, (oldData: Comment[] = []) => {
      if (parentId) {
        // Adicionar como resposta
        return addReplyToComment(oldData, parentId, optimisticComment);
      } else {
        // Adicionar como comentário raiz
        return [...oldData, optimisticComment];
      }
    });

    log('Comentário otimista adicionado', { 
      optimisticId: optimisticComment.id, 
      lessonId 
    });

    return optimisticComment;
  }, [user, lessonId, queryClient, queryKey, log]);

  // Adicionar resposta a um comentário existente
  const addReplyToComment = useCallback((comments: Comment[], parentId: string, reply: Comment): Comment[] => {
    return comments.map(comment => {
      if (comment.id === parentId) {
        return { ...comment, replies: [...(comment.replies || []), reply] };
      } else if (comment.replies) {
        return { ...comment, replies: addReplyToComment(comment.replies, parentId, reply) };
      } else {
        return comment;
      }
    });
  }, []);

  // Confirmar comentário otimista (após sucesso no servidor)
  const confirmOptimisticComment = useCallback((optimisticId: string, confirmedComment: Comment) => {
    optimisticCommentsRef.current.delete(optimisticId);

    queryClient.setQueryData(queryKey, (oldData: Comment[] = []) => {
      return replaceOptimisticComment(oldData, optimisticId, confirmedComment);
    });

    log('Comentário otimista confirmado', { 
      optimisticId, 
      newId: confirmedComment.id, 
      lessonId 
    });
  }, [queryClient, queryKey, log, lessonId]);

  // Remover comentário otimista (em caso de erro)
  const removeOptimisticComment = useCallback((optimisticId: string) => {
    optimisticCommentsRef.current.delete(optimisticId);

    queryClient.setQueryData(queryKey, (oldData: Comment[] = []) => {
      return filterOutOptimisticComment(oldData, optimisticId);
    });

    log('Comentário otimista removido', { optimisticId, lessonId });
  }, [queryClient, queryKey, log, lessonId]);

  // Substituir comentário otimista por um confirmado
  const replaceOptimisticComment = useCallback((comments: Comment[], optimisticId: string, confirmedComment: Comment): Comment[] => {
    return comments.map(comment => {
      if (comment.id === optimisticId) {
        return confirmedComment;
      } else if (comment.replies) {
        return { ...comment, replies: replaceOptimisticComment(comment.replies, optimisticId, confirmedComment) };
      } else {
        return comment;
      }
    });
  }, []);

  // Filtrar comentário otimista
  const filterOutOptimisticComment = useCallback((comments: Comment[], optimisticId: string): Comment[] => {
    return comments.filter(comment => comment.id !== optimisticId).map(comment => {
      if (comment.replies) {
        return { ...comment, replies: filterOutOptimisticComment(comment.replies, optimisticId) };
      } else {
        return comment;
      }
    });
  }, []);

  // Sincronização "inteligente" (recarregar dados se necessário)
  const performSmartSync = useCallback(async () => {
    try {
      log('Iniciando sincronização inteligente', { lessonId });
      await queryClient.refetchQueries({ queryKey });
      log('Sincronização inteligente concluída', { lessonId });
    } catch (error) {
      logError('Erro na sincronização inteligente', { error, lessonId });
    }
  }, [queryClient, queryKey, log, logError, lessonId]);

  return {
    fetchComments,
    addOptimisticComment,
    confirmOptimisticComment,
    removeOptimisticComment,
    performSmartSync,
    queryKey
  };
};
