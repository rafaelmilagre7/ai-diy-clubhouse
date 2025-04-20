
import { useState } from 'react';
import { Comment } from '@/types/commentTypes';
import { useFetchModuleComments } from './comments/useFetchModuleComments';
import { useAddModuleComment } from './comments/useAddModuleComment';
import { useLikeModuleComment } from './comments/useLikeModuleComment';
import { useDeleteModuleComment } from './comments/useDeleteModuleComment';

export const useModuleCommentsRefactored = (solutionId: string, moduleId: string) => {
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  
  const { data: comments = [], isLoading } = useFetchModuleComments(solutionId, moduleId);
  const { addComment, isSubmitting } = useAddModuleComment(solutionId, moduleId);
  const { likeComment } = useLikeModuleComment(solutionId, moduleId);
  const { deleteComment } = useDeleteModuleComment(solutionId, moduleId);

  const handleSubmitComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const success = await addComment(comment, replyTo?.id || null);
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
