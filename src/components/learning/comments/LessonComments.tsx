
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
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
  const {
    comments,
    isLoading,
    addComment,
    deleteComment,
    likeComment,
    isSubmitting,
    error
  } = useLessonComments(lessonId);
  
  // Ativar atualizações em tempo real
  useRealtimeLessonComments(lessonId);
  
  log('Renderizando componente de comentários', { 
    lessonId, 
    commentsCount: comments?.length || 0,
    hasError: !!error
  });
  
  const handleSubmitComment = async (content: string, parentId: string | null = null) => {
    log('Tentando enviar comentário', { lessonId, hasParentId: !!parentId });
    await addComment(content, parentId);
  };

  return (
    <div className="space-y-6">
      <div className="px-0 pt-0">
        <h3 className="flex items-center gap-3 text-xl font-semibold text-foreground mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <span>Comentários</span>
        </h3>
        <p className="text-muted-foreground/80 text-sm">
          Compartilhe suas dúvidas e experiências sobre esta aula
        </p>
      </div>
      
      <div className="backdrop-blur-sm bg-surface-elevated/30 rounded-xl border border-border/30 p-4 shadow-lg">
        <CommentForm
          lessonId={lessonId}
          onSubmit={handleSubmitComment}
          isSubmitting={isSubmitting}
        />
      </div>
      
      <CommentList
        comments={comments}
        lessonId={lessonId}
        onReply={handleSubmitComment}
        onDelete={deleteComment}
        onLike={likeComment}
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        error={error as Error | null}
      />
    </div>
  );
};

export default LessonComments;
