
import React from "react";
import { Comment } from "@/types/learningTypes";
import { CommentItem } from "./CommentItem";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CommentListProps {
  comments: Comment[];
  lessonId: string;
  onReply: (content: string, parentId: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onLike: (commentId: string) => Promise<void>;
  isLoading?: boolean;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  lessonId,
  onReply,
  onDelete,
  onLike,
  isLoading = false
}) => {
  // Filtrar para mostrar apenas comentários principais (não respostas)
  const rootComments = comments.filter(comment => !comment.parent_id);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-4">
            <div className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2 flex-1">
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-16 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
  
  if (rootComments.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Nenhum comentário ainda</h3>
        <p className="text-muted-foreground mt-2">
          Seja o primeiro a comentar nesta aula!
        </p>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {rootComments.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          lessonId={lessonId}
          onReply={onReply}
          onDelete={onDelete}
          onLike={onLike}
        />
      ))}
    </div>
  );
};
