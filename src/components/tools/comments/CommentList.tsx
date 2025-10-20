
import { Comment } from '@/types/commentTypes';
import { CommentItem } from './CommentItem';
import { useAuth } from '@/contexts/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
  toolId: string;
  onReply: (comment: Comment) => void;
  onDelete: (commentId: string) => void;
}

export const CommentList = ({
  comments,
  isLoading,
  toolId,
  onReply,
  onDelete
}: CommentListProps) => {
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3 p-4 border border-white/5 rounded-lg bg-backgroundLight">
            <div className="flex items-center gap-2">
              <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
              <div>
                <Skeleton className="h-4 w-24 bg-white/10" />
                <Skeleton className="h-3 w-16 mt-1 bg-white/10" />
              </div>
            </div>
            <Skeleton className="h-16 w-full bg-white/10" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16 bg-white/10" />
              <Skeleton className="h-8 w-16 bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed border-2 border-viverblue/20 bg-viverblue/5">
        <MessageSquare className="h-12 w-12 mx-auto text-viverblue/40 mb-4" />
        <p className="text-textSecondary">
          Ainda não há comentários. Seja o primeiro a comentar!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {comments.map((comment) => (
        <div key={comment.id} className="space-y-6">
          <CommentItem
            comment={comment}
            currentUserId={user?.id}
            toolId={toolId}
            onReply={() => onReply(comment)}
            onDelete={() => onDelete(comment.id)}
          />
          
          {/* Respostas */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="pl-6 border-l border-white/10 space-y-6">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUserId={user?.id}
                  toolId={toolId}
                  onReply={() => onReply(comment)}
                  onDelete={() => onDelete(reply.id)}
                  isReply
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
