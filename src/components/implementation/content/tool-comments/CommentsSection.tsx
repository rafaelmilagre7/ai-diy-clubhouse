
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { CommentList } from './CommentList';
import { CommentForm } from './CommentForm';
import { useToolComments } from '@/hooks/useToolComments';
import { MessageSquare } from 'lucide-react';
import { Comment } from '@/types/commentTypes';
import { useRealtimeComments } from '@/hooks/implementation/useRealtimeComments';

interface CommentsSectionProps {
  solutionId: string;
  moduleId: string;
}

export const CommentsSection = ({ solutionId, moduleId }: CommentsSectionProps) => {
  const toolId = `${solutionId}_${moduleId}`;
  
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
  
  // Ativar comentários em tempo real
  useRealtimeComments(solutionId, moduleId);
  
  // Garantir que comments é um array
  const safeComments = Array.isArray(comments) ? comments : [];

  // Adaptar as funções para passar diretamente o objeto de comentário
  const handleLikeComment = (comment: Comment) => {
    likeComment(comment);
  };

  const handleDeleteComment = (comment: Comment) => {
    deleteComment(comment);
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
