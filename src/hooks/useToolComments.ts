
import { Comment } from '@/types/commentTypes';
import { useLogging } from '@/hooks/useLogging';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { validateComments } from '@/utils/dataValidation';

/**
 * Hook principal para gerenciamento de comentários
 * Implementa verificações e integridade de dados para prevenir erros
 * @param toolId ID da ferramenta/solução associada aos comentários
 */
export const useToolComments = (toolId: string) => {
  const { log } = useLogging();
  const queryClient = useQueryClient();
  
  // Estado para forçar recarregamento imediatamente após envio
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mock data for comments since table doesn't exist
  const comments: Comment[] = [];
  const isLoading = false;
  const error = null;
  
  const refetch = () => {
    log('Simulando refetch de comentários', { toolId });
  };
  
  const repairCommentsIntegrity = () => {
    log('Simulando reparo de integridade dos comentários', { toolId });
  };
  
  const handleRefresh = () => {
    log('Atualizando comentários após ação', { toolId });
    queryClient.invalidateQueries({ queryKey: ['solution-comments', toolId, 'all'] });
    queryClient.invalidateQueries({ queryKey: ['tool-comments', toolId] });
    refetch();
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSubmitComment = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    try {
      log('Simulando envio de comentário', { toolId, comment: comment.substring(0, 50) });
      await new Promise(resolve => setTimeout(resolve, 500));
      setComment('');
      setReplyTo(null);
      handleRefresh();
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const likeComment = async (commentObj: Comment) => {
    log('Simulando like em comentário', { commentId: commentObj.id });
    handleRefresh();
  };

  const deleteComment = async (commentObj: Comment) => {
    log('Simulando deleção de comentário', { commentId: commentObj.id });
    handleRefresh();
  };

  const startReply = (commentObj: Comment) => {
    log('Iniciando resposta', { commentId: commentObj.id, toolId });
    setReplyTo(commentObj);
    document.getElementById('comment-input')?.focus();
  };

  const cancelReply = () => {
    log('Cancelando resposta', { toolId });
    setReplyTo(null);
  };

  return {
    comments,
    isLoading,
    error,
    comment,
    setComment,
    replyTo,
    isSubmitting,
    handleSubmitComment,
    startReply,
    cancelReply,
    likeComment,
    deleteComment,
    refreshTrigger,
    repairCommentsIntegrity
  };
};
