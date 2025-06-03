
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useLogging } from '@/hooks/useLogging';
import { Comment, normalizeCommentData, RawCommentData } from '@/types/learningTypes';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

export const useOptimizedLessonComments = (lessonId: string) => {
  const { user } = useAuth();
  const { log, logError } = useLogging();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const syncInProgressRef = useRef(false);
  const queryKey = ['learning-comments', lessonId];

  // Fetch comments com normalização
  const fetchComments = useCallback(async (): Promise<Comment[]> => {
    try {
      log('Buscando comentários otimizados', { lessonId });
      
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
        .order('created_at', { ascending: true });

      if (error) {
        logError('Erro ao buscar comentários', { error, lessonId });
        throw error;
      }

      // Normalizar dados do Supabase
      const normalizedComments = (data || []).map((rawComment: RawCommentData) => 
        normalizeCommentData(rawComment)
      );

      log('Comentários carregados e normalizados', { 
        count: normalizedComments.length, 
        lessonId 
      });

      return normalizedComments;
    } catch (error) {
      logError('Erro crítico ao buscar comentários', { error, lessonId });
      throw error;
    }
  }, [lessonId, log, logError]);

  // Query principal otimizada
  const {
    data: comments = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: fetchComments,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (failureCount < 2) {
        log('Tentando novamente buscar comentários', { 
          attempt: failureCount + 1, 
          lessonId 
        });
        return true;
      }
      return false;
    }
  });

  // Mutation para adicionar comentário
  const addCommentMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId: string | null }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const commentData = {
        content: content.trim(),
        lesson_id: lessonId,
        user_id: user.id,
        parent_id: parentId,
        likes_count: 0
      };

      const { data, error } = await supabase
        .from('learning_comments')
        .insert(commentData)
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

      if (error) throw error;
      return normalizeCommentData(data as RawCommentData);
    },
    onMutate: async ({ content, parentId }) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey });

      // Snapshot do estado anterior
      const previousComments = queryClient.getQueryData<Comment[]>(queryKey) || [];

      // Comentário otimista
      const optimisticComment: Comment = {
        id: `optimistic-${Date.now()}`,
        content: content.trim(),
        created_at: new Date().toISOString(),
        user_id: user?.id || '',
        lesson_id: lessonId,
        parent_id: parentId,
        likes_count: 0,
        profiles: {
          id: user?.id,
          name: user?.user_metadata?.name || user?.email || 'Você',
          avatar_url: user?.user_metadata?.avatar_url || '',
          role: 'member'
        },
        user_has_liked: false,
        replies: []
      };

      // Atualizar cache otimisticamente
      queryClient.setQueryData<Comment[]>(queryKey, [optimisticComment, ...previousComments]);

      return { previousComments };
    },
    onSuccess: (newComment) => {
      // Substituir comentário otimista pelo real
      queryClient.setQueryData<Comment[]>(queryKey, (old = []) => {
        const filtered = old.filter(comment => !comment.id.startsWith('optimistic-'));
        return [newComment, ...filtered];
      });

      toast.success('Comentário adicionado com sucesso!');
      log('Comentário adicionado com sucesso', { commentId: newComment.id, lessonId });
    },
    onError: (error, variables, context) => {
      // Reverter cache em caso de erro
      if (context?.previousComments) {
        queryClient.setQueryData(queryKey, context.previousComments);
      }
      
      logError('Erro ao adicionar comentário', { error, lessonId });
      toast.error('Erro ao adicionar comentário. Tente novamente.');
    }
  });

  // Mutation para deletar comentário
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('learning_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      return commentId;
    },
    onSuccess: (deletedId) => {
      // Remover do cache
      queryClient.setQueryData<Comment[]>(queryKey, (old = []) =>
        old.filter(comment => comment.id !== deletedId)
      );
      
      toast.success('Comentário removido!');
      log('Comentário deletado', { commentId: deletedId, lessonId });
    },
    onError: (error) => {
      logError('Erro ao deletar comentário', { error, lessonId });
      toast.error('Erro ao remover comentário');
    }
  });

  // Mutation para curtir comentário
  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se já curtiu
      const { data: existingLike } = await supabase
        .from('learning_comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Remover curtida
        await supabase
          .from('learning_comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        return { action: 'unlike', commentId };
      } else {
        // Adicionar curtida
        await supabase
          .from('learning_comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });

        return { action: 'like', commentId };
      }
    },
    onSuccess: ({ action, commentId }) => {
      // Atualizar cache
      queryClient.setQueryData<Comment[]>(queryKey, (old = []) =>
        old.map(comment => 
          comment.id === commentId
            ? {
                ...comment,
                likes_count: action === 'like' 
                  ? comment.likes_count + 1 
                  : Math.max(0, comment.likes_count - 1),
                user_has_liked: action === 'like'
              }
            : comment
        )
      );

      log('Curtida atualizada', { action, commentId, lessonId });
    },
    onError: (error) => {
      logError('Erro ao atualizar curtida', { error, lessonId });
      toast.error('Erro ao atualizar curtida');
    }
  });

  // Funções de interface
  const addComment = useCallback(async (content: string, parentId: string | null = null) => {
    if (!content.trim()) {
      toast.error('Comentário não pode estar vazio');
      return;
    }

    setIsSubmitting(true);
    try {
      await addCommentMutation.mutateAsync({ content, parentId });
    } finally {
      setIsSubmitting(false);
    }
  }, [addCommentMutation]);

  const deleteComment = useCallback(async (commentId: string) => {
    await deleteCommentMutation.mutateAsync(commentId);
  }, [deleteCommentMutation]);

  const likeComment = useCallback(async (commentId: string) => {
    await likeCommentMutation.mutateAsync(commentId);
  }, [likeCommentMutation]);

  // Smart sync para operações críticas
  const performSmartSync = useCallback(async () => {
    if (syncInProgressRef.current) {
      log('Sync já em andamento, ignorando', { lessonId });
      return;
    }

    syncInProgressRef.current = true;
    try {
      log('Executando smart sync', { lessonId });
      await refetch();
    } finally {
      syncInProgressRef.current = false;
    }
  }, [refetch, lessonId, log]);

  return {
    // Dados
    comments,
    isLoading,
    error,
    isSubmitting,
    
    // Ações
    addComment,
    deleteComment,
    likeComment,
    performSmartSync,
    
    // Funções auxiliares
    fetchComments,
    queryKey
  };
};
