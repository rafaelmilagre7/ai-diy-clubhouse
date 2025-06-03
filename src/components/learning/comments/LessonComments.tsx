
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLessonComments } from "@/hooks/learning/useLessonComments";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";
import { useRealtimeLessonComments } from "@/hooks/learning/useRealtimeLessonComments";
import { useLogging } from "@/hooks/useLogging";

interface LessonCommentsProps {
  lessonId: string;
}

export const LessonComments: React.FC<LessonCommentsProps> = ({ lessonId }) => {
  const { log } = useLogging();
  
  // Hook principal otimizado
  const {
    comments,
    isLoading,
    addComment,
    deleteComment,
    likeComment,
    isSubmitting,
    error,
    forceSync
  } = useLessonComments(lessonId);
  
  // Ativar realtime otimizado
  const { isConnected, performHealthCheck } = useRealtimeLessonComments(lessonId, {
    isEnabled: true,
    debounceMs: 300, // Debounce de 300ms para evitar updates excessivos
    maxReconnectAttempts: 3
  });
  
  log('Renderizando comentários otimizados', { 
    lessonId, 
    commentsCount: Array.isArray(comments) ? comments.length : 0,
    hasError: !!error,
    isConnected,
    isSubmitting
  });
  
  const handleSubmitComment = async (content: string, parentId: string | null = null) => {
    log('Enviando comentário otimizado', { lessonId, hasParentId: !!parentId });
    try {
      await addComment(content, parentId);
    } catch (error) {
      log('Erro ao enviar comentário', { 
        lessonId, 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };

  const handleForceSync = async () => {
    log('Forçando sincronização manual', { lessonId });
    await forceSync();
    performHealthCheck();
  };

  // Garantir que comments seja sempre um array
  const safeComments = Array.isArray(comments) ? comments : [];

  return (
    <div className="space-y-6">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <span>Comentários</span>
            {!isConnected && (
              <span className="text-xs text-yellow-500">(modo offline)</span>
            )}
          </CardTitle>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleForceSync}
            className="text-xs"
            disabled={isSubmitting}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Sincronizar
          </Button>
        </div>
      </CardHeader>
      
      <CommentForm
        lessonId={lessonId}
        onSubmit={handleSubmitComment}
        isSubmitting={isSubmitting}
      />
      
      <CommentList
        comments={safeComments}
        lessonId={lessonId}
        onReply={handleSubmitComment}
        onDelete={deleteComment}
        onLike={likeComment}
        isLoading={isLoading}
        error={error as Error | null}
      />
    </div>
  );
};

export default LessonComments;
