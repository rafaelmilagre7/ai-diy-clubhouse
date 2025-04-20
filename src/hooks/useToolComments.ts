
import { Comment } from '@/types/commentTypes';
import { useCommentsData } from './comments/useCommentsData';
import { useCommentForm } from './comments/useCommentForm';
import { useCommentActions } from './comments/useCommentActions';

export const useToolComments = (toolId: string) => {
  const { comments, isLoading, error, refetch } = useCommentsData(toolId);
  
  const {
    comment,
    setComment,
    replyTo,
    setReplyTo,
    isSubmitting,
    handleSubmitComment
  } = useCommentForm(toolId, refetch);

  const { likeComment, deleteComment } = useCommentActions(refetch);

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
