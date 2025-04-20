
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
    likeComment,
    deleteComment
  } = useToolComments(toolId);

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
        comments={comments}
        isLoading={isLoading}
        onReply={startReply}
        onLike={likeComment}
        onDelete={deleteComment}
      />
    </div>
  );
};
