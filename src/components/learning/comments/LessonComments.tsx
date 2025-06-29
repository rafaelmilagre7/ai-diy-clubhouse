
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
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <span>Comentários</span>
        </CardTitle>
      </CardHeader>
      
      <CommentForm
        lessonId={lessonId}
        onSubmit={handleSubmitComment}
        isSubmitting={isSubmitting}
      />
      
      <CommentList
        comments={comments}
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
