
import { useState } from 'react';
import { Comment } from '@/types/commentTypes';
import { useFetchModuleComments } from './comments/useFetchModuleComments';
import { useAddComment } from './comments/useAddComment';
import { useLikeModuleComment } from './comments/useLikeModuleComment';
import { useDeleteModuleComment } from './comments/useDeleteModuleComment';
import { useLogging } from '@/hooks/useLogging';

export const useModuleCommentsRefactored = (solutionId: string, moduleId: string) => {
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const { log, logError } = useLogging();
  
  // Log para diagnosticar possíveis problemas
  log('Inicializando hook de comentários', { solutionId, moduleId });
  
  const { data: comments = [], isLoading, error } = useFetchModuleComments(solutionId, moduleId);
  
  // Criar função onSuccess para useAddComment
  const onSuccess = () => {
    // Invalidar queries será tratado dentro do hook useAddComment
  };
  
  const { addComment, isSubmitting } = useAddComment(onSuccess);
  const { likeComment } = useLikeModuleComment(solutionId, moduleId);
  const { deleteComment } = useDeleteModuleComment(solutionId, moduleId);

  // Log para diagnosticar possíveis problemas com os dados carregados
  if (error) {
    logError('Erro ao carregar comentários', { error, solutionId, moduleId });
  } else {
    log('Comentários carregados', { count: comments.length, solutionId, moduleId });
  }

  const handleSubmitComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const success = await addComment(solutionId, comment, replyTo?.id || undefined);
    if (success) {
      setComment('');
      setReplyTo(null);
    }
  };

  const startReply = (commentObj: Comment) => {
    setReplyTo(commentObj);
    document.getElementById('comment-input')?.focus();
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  return {
    comments,
    isLoading,
    comment,
    setComment,
    replyTo,
    isSubmitting,
    handleSubmitComment,
    startReply,
    cancelReply,
    likeComment,
    deleteComment
  };
};
