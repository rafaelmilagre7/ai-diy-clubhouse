
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { CommentList } from './CommentList';
import { CommentForm } from './CommentForm';
import { useToolComments } from '@/hooks/useToolComments';
import { MessageSquare } from 'lucide-react';
import { Comment } from '@/types/commentTypes';
import { useRealtimeComments } from '@/hooks/implementation/useRealtimeComments';
import { useLogging } from '@/hooks/useLogging';

interface CommentsSectionProps {
  solutionId: string;
  moduleId: string;
}

export const CommentsSection = ({ solutionId, moduleId }: CommentsSectionProps) => {
  // Utilizamos apenas o solutionId como identificador do toolId
  const toolId = solutionId;
  const { log } = useLogging();
  
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
  
  // Log para diagnóstico
  React.useEffect(() => {
    log('Renderizando seção de comentários', { 
      solutionId, 
      moduleId,
      commentsCount: safeComments.length,
      loadingState: isLoading ? 'carregando' : 'concluído'
    });
  }, [solutionId, moduleId, safeComments.length, isLoading, log]);

  // Adaptar as funções para passar diretamente o objeto de comentário
  const handleLikeComment = (comment: Comment) => {
    log('Curtindo comentário', { commentId: comment.id });
    likeComment(comment);
  };

  const handleDeleteComment = (comment: Comment) => {
    log('Deletando comentário', { commentId: comment.id });
    deleteComment(comment);
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
        comments={safeComments}
        isLoading={isLoading}
        onReply={startReply}
        onLike={handleLikeComment}
        onDelete={handleDeleteComment}
      />
    </div>
  );
};
