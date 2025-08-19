
import React from 'react';
import { useModuleCommentsRefactored } from '@/hooks/implementation/useModuleCommentsRefactored';
import { CommentForm } from './tool-comments/CommentForm';
import { CommentList } from './tool-comments/CommentList';
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
    startReply,
    cancelReply,
    likeComment,
    deleteComment
  } = useModuleCommentsRefactored(solutionId, moduleId);

  return (
    <div className="space-y-6 mt-8">
      <h3 className="text-lg font-semibold">Discussão</h3>
      <p className="text-muted-foreground">
        Compartilhe suas experiências, dúvidas ou dicas sobre esta solução com outros membros da plataforma.
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
