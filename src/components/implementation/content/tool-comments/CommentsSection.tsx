
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { CommentList } from './CommentList';
import { CommentForm } from './CommentForm';
import { useToolComments } from '@/hooks/useToolComments';
import { MessageSquare } from 'lucide-react';
import { Comment } from '@/types/commentTypes';

interface CommentsSectionProps {
  solutionId: string;
  moduleId: string;
}

export const CommentsSection = ({ solutionId, moduleId }: CommentsSectionProps) => {
  const {
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
  } = useToolComments(`${solutionId}_${moduleId}`);
  
  // Garantir que comments é um array
  const safeComments = Array.isArray(comments) ? comments : [];

  // Adaptar as funções para corresponder aos tipos esperados
  const handleLikeComment = (commentId: string) => {
    const commentToLike = safeComments.find(c => c.id === commentId) || 
                          safeComments.flatMap(c => c.replies || []).find(c => c.id === commentId);
    if (commentToLike) {
      likeComment(commentToLike);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    const commentToDelete = safeComments.find(c => c.id === commentId) || 
                            safeComments.flatMap(c => c.replies || []).find(c => c.id === commentId);
    if (commentToDelete) {
      deleteComment(commentToDelete);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-[#0ABAB5]" />
        <h2 className="text-xl font-semibold">Comentários</h2>
      </div>
      
      <CommentForm
        comment={comment}
        setComment={setComment}
        replyTo={replyTo}
        cancelReply={cancelReply}
        onSubmit={handleSubmitComment}
        isSubmitting={isSubmitting}
      />

      <Separator />
      
      <CommentList
        comments={safeComments}
        isLoading={isLoading}
        onReply={startReply}
        onLike={handleLikeComment}
        onDelete={handleDeleteComment}
      />
    </div>
  );
};
