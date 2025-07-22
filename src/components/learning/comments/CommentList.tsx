
import React from "react";
import { Comment } from "@/types/learningTypes";
import { CommentItem } from "./CommentItem";
import { Card } from "@/components/ui/card";
import { AlertTriangle, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CommentListProps {
  comments: Comment[];
  lessonId?: string;
  onReply: (content: string, parentId: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onLike: (commentId: string) => Promise<void>;
  isLoading?: boolean;
  error?: Error | null;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  lessonId,
  onReply,
  onDelete,
  onLike,
  isLoading = false,
  error = null
}) => {
  // Garantir que comments seja sempre um array antes de chamar filter
  const safeComments = Array.isArray(comments) ? comments : [];
  
  // Filtrar para mostrar apenas comentários principais (não respostas)
  const rootComments = safeComments.filter(comment => !comment.parent_id);
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar comentários: {error.message || "Ocorreu um erro inesperado"}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="backdrop-blur-sm bg-white/5 border-0 rounded-xl p-4 shadow-lg animate-pulse">
            <div className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full bg-white/10" />
              <div className="space-y-2 flex-1">
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-24 bg-white/10" />
                  <Skeleton className="h-4 w-16 bg-white/10" />
                </div>
                <Skeleton className="h-16 w-full bg-white/10" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16 bg-white/10" />
                  <Skeleton className="h-8 w-24 bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (rootComments.length === 0) {
    return (
      <div className="backdrop-blur-sm bg-white/5 border-0 rounded-xl p-8 text-center shadow-lg border border-white/10">
        <MessageSquare className="h-12 w-12 mx-auto text-primary/60 mb-4" />
        <h3 className="text-lg font-medium text-foreground">Nenhum comentário ainda</h3>
        <p className="text-muted-foreground/80 mt-2">
          Seja o primeiro a comentar nesta aula!
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {rootComments.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          lessonId={lessonId || ""}
          onReply={onReply}
          onDelete={onDelete}
          onLike={onLike}
        />
      ))}
    </div>
  );
};

export default CommentList;
