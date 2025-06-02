
import { Comment } from '@/types/commentTypes';
import { useCommentsData } from './comments/useCommentsData';
import { useCommentForm } from './comments/useCommentForm';
import { useCommentActions } from './comments/useCommentActions';
import { useOptimisticComments } from './comments/useOptimisticComments';
import { useLogging } from '@/hooks/useLogging';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { validateComments } from '@/utils/dataValidation';
import { useCommentsIntegrity } from './comments/useCommentsIntegrity';

/**
 * Hook principal para gerenciamento de comentários com optimistic updates
 * Implementa atualizações imediatas na UI e sincronização com servidor
 * @param toolId ID da ferramenta/solução associada aos comentários
 */
export const useToolComments = (toolId: string) => {
  const { log } = useLogging();
  const queryClient = useQueryClient();
  
  // Chave de query padronizada
  const queryKey = ['comments', toolId];
  
  // Estado para forçar recarregamento imediatamente após envio
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const { comments: rawComments, isLoading, error, refetch } = useCommentsData(toolId);
  
  // Validar os comentários para garantir integridade dos dados
  const serverComments = validateComments(rawComments, toolId);
  
  // Hook para optimistic updates
  const {
    addOptimisticComment,
    confirmOptimisticComment,
    removeOptimisticComment,
    getCommentsWithOptimistic,
    hasOptimisticComments
  } = useOptimisticComments(queryKey);
  
  // Combinar comentários do servidor com otimistas
  const comments = getCommentsWithOptimistic(serverComments);
  
  // Integrar verificação de integridade
  const { repairCommentsIntegrity } = useCommentsIntegrity(toolId);
  
  const handleRefresh = () => {
    log('Atualizando comentários após ação', { toolId });
    // Invalidar múltiplas variações de chaves para compatibilidade
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ['solution-comments', toolId, 'all'] });
    queryClient.invalidateQueries({ queryKey: ['tool-comments', toolId] });
    
    // Forçar recarregamento imediato
    refetch();
    setRefreshTrigger(prev => prev + 1);
  };

  const {
    comment,
    setComment,
    replyTo,
    setReplyTo,
    isSubmitting,
    handleSubmitComment: originalSubmitComment
  } = useCommentForm(toolId, () => {
    log('Comentário enviado, recarregando dados', { toolId });
    handleRefresh();
  });

  // Wrapper para adicionar optimistic updates
  const handleSubmitComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!comment.trim()) return;
    
    // 1. Adicionar comentário otimista imediatamente
    const optimisticComment = addOptimisticComment(comment, replyTo?.id);
    if (!optimisticComment) return;
    
    // 2. Tentar enviar para o servidor
    try {
      const success = await originalSubmitComment();
      
      if (success) {
        // 3. Confirmar comentário otimista (será substituído pelos dados do servidor)
        setTimeout(() => {
          confirmOptimisticComment(optimisticComment.id, optimisticComment as Comment);
        }, 500);
        
        // Limpar formulário
        setComment('');
        setReplyTo(null);
      } else {
        // 4. Remover comentário otimista se falhou
        removeOptimisticComment(optimisticComment.id);
      }
    } catch (error) {
      log('Erro ao enviar comentário', { error, toolId });
      removeOptimisticComment(optimisticComment.id);
    }
  };

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
    isSubmitting: isSubmitting || hasOptimisticComments,
    handleSubmitComment,
    startReply,
    cancelReply,
    likeComment,
    deleteComment,
    refreshTrigger,
    repairCommentsIntegrity
  };
};
