
import { useState } from 'react';
import { Comment } from '@/types/commentTypes';
import { useFetchComments } from './comments/useFetchComments';
import { useAddComment } from './comments/useAddComment';
import { useLikeComment } from './comments/useLikeComment';
import { useDeleteComment } from './comments/useDeleteComment';

export const useSolutionComments = (solutionId: string, moduleId: string) => {
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  
  const { data: comments = [], isLoading } = useFetchComments(solutionId, moduleId);
  
  // Criar função onSuccess para useAddComment
  const onSuccess = () => {
    // Invalidar queries será tratado dentro do hook useAddComment
  };
  
  const { addComment, isSubmitting } = useAddComment(onSuccess);
  const { likeComment } = useLikeComment(solutionId);
  const { deleteComment } = useDeleteComment(solutionId, moduleId);

  const handleSubmitComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const success = await addComment(solutionId, comment, replyTo?.id);
    if (success) {
      setComment('');
      setReplyTo(null);
    }
  };

  return {
    comments,
    isLoading,
    comment,
    setComment,
    replyTo,
    isSubmitting,
    handleSubmitComment,
    setReplyTo,
    likeComment,
    deleteComment
  };
};
