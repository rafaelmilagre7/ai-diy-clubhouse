
import React, { useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { CommentList } from './CommentList';
import { CommentForm } from './CommentForm';
import { useToolComments } from '@/hooks/useToolComments';
import { MessageSquare, RefreshCw } from 'lucide-react';
import { Comment } from '@/types/commentTypes';
import { useRealtimeComments } from '@/hooks/implementation/useRealtimeComments';
import { useLogging } from '@/hooks/useLogging';
import { Button } from '@/components/ui/button';

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
    error,
    comment,
    setComment,
    replyTo,
    isSubmitting,
    handleSubmitComment,
    startReply,
    cancelReply,
    likeComment,
    deleteComment,
    refreshTrigger,
    repairCommentsIntegrity
  } = useToolComments(toolId);
  
  // Ativar comentários em tempo real
  useRealtimeComments(solutionId, moduleId);
  
  // Log para diagnóstico
  useEffect(() => {
    log('Renderizando seção de comentários', { 
      solutionId, 
      moduleId,
      commentsCount: comments.length,
      loadingState: isLoading ? 'carregando' : 'concluído',
      refreshTrigger
    });
    
    // Adicionamos o refreshTrigger na dependência para relogar quando for atualizado
  }, [solutionId, moduleId, comments.length, isLoading, refreshTrigger, log]);

  // Adaptar as funções para passar diretamente o objeto de comentário
  const handleLikeComment = (comment: Comment) => {
    log('Curtindo comentário', { commentId: comment.id });
    likeComment(comment);
  };

  const handleDeleteComment = (comment: Comment) => {
    log('Deletando comentário', { commentId: comment.id });
    deleteComment(comment);
  };

  const handleRefreshComments = () => {
    repairCommentsIntegrity();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-aurora-primary" />
          <h2 className="text-xl font-semibold text-textPrimary">Comentários</h2>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefreshComments}
          className="flex items-center gap-1 text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1" />
          Atualizar
        </Button>
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
        error={error as Error | null}
        onReply={startReply}
        onLike={handleLikeComment}
        onDelete={handleDeleteComment}
      />
    </div>
  );
};
