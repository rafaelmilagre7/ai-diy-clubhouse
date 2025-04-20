
import { Comment } from '@/types/commentTypes';
import { CommentItem } from './CommentItem';
import { useAuth } from '@/contexts/auth';
import { Skeleton } from '@/components/ui/skeleton';

interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
  onReply: (comment: Comment) => void;
  onLike: (commentId: string) => void;
  onDelete: (commentId: string) => void;
}

export const CommentList = ({
  comments,
  isLoading,
  onReply,
  onLike,
  onDelete
}: CommentListProps) => {
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16 mt-1" />
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
        <p className="text-muted-foreground">
          Ainda não há comentários. Seja o primeiro a comentar!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {comments.map((comment) => (
        <div key={comment.id} className="space-y-6">
          <CommentItem
            comment={comment}
            currentUserId={user?.id}
            onReply={() => onReply(comment)}
            onLike={() => onLike(comment.id)}
            onDelete={() => onDelete(comment.id)}
          />
          
          {/* Respostas */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="pl-6 border-l border-gray-200 space-y-6">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUserId={user?.id}
                  onReply={() => onReply(comment)}
                  onLike={() => onLike(reply.id)}
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
