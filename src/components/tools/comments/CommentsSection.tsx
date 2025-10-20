
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { CommentList } from './CommentList';
import { CommentForm } from './CommentForm';
import { useToolComments } from '@/hooks/useToolComments';
import { MessageSquare } from 'lucide-react';
import { Comment } from '@/types/commentTypes';

interface CommentsSectionProps {
  toolId: string;
}

export const CommentsSection = ({ toolId }: CommentsSectionProps) => {
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
    deleteComment
  } = useToolComments(toolId);

  const handleDeleteComment = (commentId: string) => {
    const commentToDelete = comments.find(c => c.id === commentId) || 
                            comments.flatMap(c => c.replies || []).find(c => c.id === commentId);
    if (commentToDelete) {
      deleteComment(commentToDelete);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-viverblue" />
        <h2 className="text-xl font-semibold text-textPrimary">Comentários</h2>
      </div>
      
      <CommentForm
        comment={comment}
        setComment={setComment}
        replyTo={replyTo}
        cancelReply={cancelReply}
        onSubmit={handleSubmitComment}
        isSubmitting={isSubmitting}
      />

      <Separator className="bg-white/10" />
      
      <CommentList
        comments={comments}
        isLoading={isLoading}
        toolId={toolId}
        onReply={startReply}
        onDelete={handleDeleteComment}
      />
    </div>
  );
};
