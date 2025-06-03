
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { useLogging } from '@/hooks/useLogging';
import { Comment } from '@/types/learningTypes';
import { useOptimizedLessonComments } from './useOptimizedLessonComments';
import { useCommentSync } from './useCommentSync';
import { toast } from 'sonner';

export const useLessonComments = (lessonId: string) => {
  const { user } = useAuth();
  const { log, logError } = useLogging();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Hooks otimizados
  const {
    fetchComments,
    addOptimisticComment,
    confirmOptimisticComment,
    removeOptimisticComment,
    performSmartSync,
    queryKey
  } = useOptimizedLessonComments(lessonId);
  
  const { queueOperation } = useCommentSync(lessonId);
  
  // Query principal com stale time otimizado
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
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error: any) => {
      logError('Erro ao carregar comentários', { 
        error, 
        lessonId,
        showToast: false // Não mostrar toast para erros de carregamento
      });
    }
  });

  // Adicionar comentário com sync otimizado
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
      // 1. Adicionar comentário otimista
      const optimisticComment = addOptimisticComment(content.trim(), parentId || undefined);
      
      if (!optimisticComment) {
        throw new Error('Falha ao criar comentário otimista');
      }
      
      // 2. Adicionar à fila de sincronização
      queueOperation({
        type: 'add',
        data: { content: content.trim(), parentId }
      });
      
      // 3. Confirmar comentário otimista após delay (simular resposta do servidor)
      setTimeout(() => {
        confirmOptimisticComment(optimisticComment.id, {
          ...optimisticComment,
          id: `confirmed_${Date.now()}` // Simular ID do servidor
        });
      }, 1000);
      
      toast.success('Comentário adicionado com sucesso');
      
      log('Comentário adicionado', { 
        lessonId, 
        hasParentId: !!parentId,
        optimisticId: optimisticComment.id
      });
      
    } catch (error: any) {
      // Remover comentário otimista em caso de erro
      const optimisticId = `optimistic_${Date.now()}`;
      removeOptimisticComment(optimisticId);
      
      logError('Erro ao adicionar comentário', { 
        error, 
        lessonId,
        showToast: true
      });
      
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
      const newLikesCount = isCurrentlyLiked 
        ? currentComment.likes_count - 1 
        : currentComment.likes_count + 1;
      
      // Atualização otimista no cache
      // (implementação seria similar ao addOptimisticComment, mas para likes)
      
      // Adicionar à fila de sincronização
      queueOperation({
        type: 'like',
        data: { commentId, isLiking: !isCurrentlyLiked }
      });
      
      log('Comentário curtido/descurtido', { 
        commentId, 
        isLiking: !isCurrentlyLiked,
        newLikesCount 
      });
      
    } catch (error: any) {
      logError('Erro ao curtir comentário', { 
        error, 
        commentId,
        showToast: true
      });
      
      toast.error('Erro ao curtir comentário. Tente novamente.');
    }
  };

  // Forçar sincronização
  const forceSync = async () => {
    try {
      log('Forçando sincronização de comentários', { lessonId });
      await performSmartSync();
      toast.success('Comentários sincronizados');
    } catch (error: any) {
      logError('Erro na sincronização forçada', { error, lessonId });
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
    isSubmitting,
    forceSync,
    refetch
  };
};
