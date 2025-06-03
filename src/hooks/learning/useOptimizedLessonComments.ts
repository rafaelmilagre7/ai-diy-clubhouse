
import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useLogging } from '@/hooks/useLogging';
import { useOfflinePersistence } from './useOfflinePersistence';
import { useSyncMonitor } from '@/hooks/monitoring/useSyncMonitor';
import { useConflictDetection } from './useConflictDetection';
import { Comment, RawCommentData, normalizeCommentData } from '@/types/learningTypes';
import { toast } from 'sonner';

export const useOptimizedLessonComments = (lessonId: string) => {
  const { user } = useAuth();
  const { log, logError } = useLogging();
  const queryClient = useQueryClient();
  const { reportSyncIssue } = useSyncMonitor();
  const { detectBatchConflicts, validateDataIntegrity } = useConflictDetection();
  const { persistOperation, loadFromStorage } = useOfflinePersistence(lessonId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [optimisticComments, setOptimisticComments] = useState<Comment[]>([]);
  const optimisticCounterRef = useRef(0);

  const queryKey = ['learning-comments', lessonId];

  // Fetch comentários do Supabase
  const fetchComments = useCallback(async (): Promise<Comment[]> => {
    try {
      log('Buscando comentários', { lessonId });

      const { data: rawData, error } = await supabase
        .from('learning_comments')
        .select(`
          *,
          profiles (
            id,
            name,
            email,
            avatar_url,
            role
          )
        `)
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Normalizar dados do Supabase
      const normalizedComments = (rawData || []).map((item: any) => {
        return normalizeCommentData({
          ...item,
          profiles: Array.isArray(item.profiles) ? item.profiles : [item.profiles]
        } as RawCommentData);
      });

      // Validar integridade dos dados
      if (!validateDataIntegrity(normalizedComments)) {
        reportSyncIssue('stale_data', 'useOptimizedLessonComments', 'Dados com problemas de integridade');
      }

      log('Comentários carregados com sucesso', { 
        lessonId, 
        count: normalizedComments.length 
      });

      return normalizedComments;

    } catch (error) {
      logError('Erro ao buscar comentários', { error, lessonId });
      reportSyncIssue('cache_miss', 'useOptimizedLessonComments', 'Falha no carregamento');
      return [];
    }
  }, [lessonId, log, logError, validateDataIntegrity, reportSyncIssue]);

  // Query principal
  const {
    data: comments = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: fetchComments,
    staleTime: 30 * 1000, // 30 segundos
    refetchOnWindowFocus: false,
    retry: 2
  });

  // Adicionar comentário otimista
  const addOptimisticComment = useCallback((content: string, parentId: string | null = null) => {
    if (!user) return null;

    const optimisticComment: Comment = {
      id: `optimistic-${++optimisticCounterRef.current}`,
      content,
      created_at: new Date().toISOString(),
      user_id: user.id,
      lesson_id: lessonId,
      parent_id: parentId,
      likes_count: 0,
      user_has_liked: false,
      profiles: {
        id: user.id,
        name: user.user_metadata?.name || user.email || 'Usuário',
        email: user.email,
        avatar_url: user.user_metadata?.avatar_url || '',
        role: 'member'
      },
      replies: []
    };

    setOptimisticComments(prev => [optimisticComment, ...prev]);
    
    log('Comentário otimista adicionado', { 
      optimisticId: optimisticComment.id,
      lessonId 
    });

    return optimisticComment;
  }, [user, lessonId, log]);

  // Confirmar comentário otimista
  const confirmOptimisticComment = useCallback((optimisticId: string, realComment: Comment) => {
    setOptimisticComments(prev => prev.filter(c => c.id !== optimisticId));
    
    // Atualizar cache do React Query
    queryClient.setQueryData(queryKey, (oldData: Comment[] | undefined) => {
      const existingData = oldData || [];
      return [realComment, ...existingData];
    });

    log('Comentário otimista confirmado', { optimisticId, realId: realComment.id });
  }, [queryClient, queryKey, log]);

  // Remover comentário otimista
  const removeOptimisticComment = useCallback((optimisticId: string) => {
    setOptimisticComments(prev => prev.filter(c => c.id !== optimisticId));
    log('Comentário otimista removido', { optimisticId });
  }, [log]);

  // Verificar se há comentários otimistas
  const hasOptimisticComments = useCallback(() => {
    return optimisticComments.length > 0;
  }, [optimisticComments.length]);

  // Sincronização inteligente
  const performSmartSync = useCallback(async () => {
    try {
      log('Iniciando sincronização inteligente', { lessonId });

      // Recarregar dados do servidor
      const { data: freshData } = await refetch();
      const serverComments = freshData || [];

      // Detectar conflitos
      const conflicts = detectBatchConflicts(comments, serverComments);
      
      if (conflicts.length > 0) {
        reportSyncIssue('conflict', 'useOptimizedLessonComments', 
          `${conflicts.length} conflitos detectados`);
      }

      log('Sincronização inteligente concluída', { 
        lessonId, 
        conflictsFound: conflicts.length 
      });

      return serverComments;

    } catch (error) {
      logError('Erro na sincronização inteligente', { error, lessonId });
      reportSyncIssue('sync_delay', 'useOptimizedLessonComments', 'Falha na sincronização');
      throw error;
    }
  }, [lessonId, log, logError, refetch, comments, detectBatchConflicts, reportSyncIssue]);

  // Adicionar comentário
  const addComment = useCallback(async (content: string, parentId: string | null = null) => {
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    const optimisticComment = addOptimisticComment(content, parentId);
    
    if (!optimisticComment) {
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('learning_comments')
        .insert({
          content,
          lesson_id: lessonId,
          user_id: user.id,
          parent_id: parentId
        })
        .select(`
          *,
          profiles (
            id,
            name,
            email,
            avatar_url,
            role
          )
        `)
        .single();

      if (error) throw error;

      const normalizedComment = normalizeCommentData({
        ...data,
        profiles: Array.isArray(data.profiles) ? data.profiles : [data.profiles]
      } as RawCommentData);

      confirmOptimisticComment(optimisticComment.id, normalizedComment);
      toast.success('Comentário adicionado com sucesso!');

    } catch (error) {
      removeOptimisticComment(optimisticComment.id);
      logError('Erro ao adicionar comentário', { error, lessonId });
      toast.error('Erro ao adicionar comentário');
    } finally {
      setIsSubmitting(false);
    }
  }, [user, isSubmitting, lessonId, addOptimisticComment, confirmOptimisticComment, removeOptimisticComment, logError]);

  // Curtir comentário
  const likeComment = useCallback(async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('learning_comment_likes')
        .upsert({
          comment_id: commentId,
          user_id: user.id
        });

      if (error) throw error;

      await refetch();
      toast.success('Curtida adicionada!');

    } catch (error) {
      logError('Erro ao curtir comentário', { error, commentId });
      toast.error('Erro ao curtir comentário');
    }
  }, [user, refetch, logError]);

  // Deletar comentário
  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('learning_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      await refetch();
      toast.success('Comentário removido!');

    } catch (error) {
      logError('Erro ao deletar comentário', { error, commentId });
      toast.error('Erro ao deletar comentário');
    }
  }, [user, refetch, logError]);

  // Combinar comentários reais com otimistas
  const allComments = [...optimisticComments, ...comments];

  return {
    comments: allComments,
    isLoading,
    error: error as Error | null,
    isSubmitting,
    addComment,
    deleteComment,
    likeComment,
    forceSync: performSmartSync,
    
    // Funções específicas do hook otimizado
    fetchComments,
    addOptimisticComment,
    confirmOptimisticComment,
    removeOptimisticComment,
    hasOptimisticComments,
    performSmartSync,
    queryKey
  };
};
