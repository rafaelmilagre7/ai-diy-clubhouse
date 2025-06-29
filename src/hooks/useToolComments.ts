
import { Comment } from '@/types/commentTypes';
import { useCommentsData } from './comments/useCommentsData';
import { useCommentForm } from './comments/useCommentForm';
import { useCommentActions } from './comments/useCommentActions';
import { useLogging } from '@/hooks/useLogging';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { validateComments } from '@/utils/dataValidation';
import { useCommentsIntegrity } from './comments/useCommentsIntegrity';

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
  
  const { comments: rawComments, isLoading, error, refetch } = useCommentsData(toolId);
  
  // Validar os comentários para garantir integridade dos dados
  const comments = validateComments(rawComments, toolId);
  
  // Integrar verificação de integridade
  const { repairCommentsIntegrity } = useCommentsIntegrity(toolId);
  
  const handleRefresh = () => {
    log('Atualizando comentários após ação', { toolId });
    // Invalidar a consulta para forçar o recarregamento
    queryClient.invalidateQueries({ queryKey: ['solution-comments', toolId, 'all'] });
    // Também invalidar keys alternativas para compatibilidade
    queryClient.invalidateQueries({ queryKey: ['tool-comments', toolId] });
    
    // Forçar recarregamento imediato
    refetch();
    // Também incrementar um contador para atualizar componentes
    setRefreshTrigger(prev => prev + 1);
  };

  const {
    comment,
    setComment,
    replyTo,
    setReplyTo,
    isSubmitting,
    handleSubmitComment
  } = useCommentForm(toolId, () => {
    log('Comentário enviado, recarregando dados', { toolId });
    handleRefresh();
  });

  const { likeComment, deleteComment } = useCommentActions(() => {
    log('Ação de comentário executada, recarregando dados', { toolId });
    handleRefresh();
  });

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
