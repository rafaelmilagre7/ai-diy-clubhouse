
import { Comment } from '@/types/commentTypes';
import { useCommentsData } from './comments/useCommentsData';
import { useCommentForm } from './comments/useCommentForm';
import { useCommentActions } from './comments/useCommentActions';
import { useLogging } from '@/hooks/useLogging';

export const useToolComments = (toolId: string) => {
  const { log } = useLogging();
  const { comments, isLoading, error, refetch } = useCommentsData(toolId);
  
  const {
    comment,
    setComment,
    replyTo,
    setReplyTo,
    isSubmitting,
    handleSubmitComment
  } = useCommentForm(toolId, () => {
    log('Comentário enviado, recarregando dados');
    refetch();
  });

  const { likeComment, deleteComment } = useCommentActions(() => {
    log('Ação de comentário executada, recarregando dados');
    refetch();
  });

  const startReply = (commentObj: Comment) => {
    log('Iniciando resposta', { commentId: commentObj.id });
    setReplyTo(commentObj);
    document.getElementById('comment-input')?.focus();
  };

  const cancelReply = () => {
    log('Cancelando resposta');
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
    deleteComment
  };
};
