
import React from 'react';
import { useSolutionComments } from '@/hooks/implementation/useSolutionComments';
import { CommentForm } from '@/components/implementation/content/tool-comments/CommentForm';
import { CommentList } from '@/components/implementation/content/tool-comments/CommentList';
import { Separator } from '@/components/ui/separator';

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
    setReplyTo,
    likeComment,
    deleteComment
  } = useSolutionComments(solutionId, moduleId);

  const startReply = (commentObj: any) => {
    setReplyTo(commentObj);
    document.getElementById('comment-input')?.focus();
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  return (
    <div className="space-y-6 mt-8">
      <h3 className="text-lg font-semibold">Discussão</h3>
      <p className="text-muted-foreground">
        Compartilhe suas experiências, dúvidas ou dicas sobre esta solução com outros membros do club.
      </p>
      
      <CommentForm
        comment={comment}
        setComment={setComment}
        replyTo={replyTo}
        cancelReply={cancelReply}
        onSubmit={handleSubmitComment}
        isSubmitting={isSubmitting}
      />

      <Separator className="my-6" />
      
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
