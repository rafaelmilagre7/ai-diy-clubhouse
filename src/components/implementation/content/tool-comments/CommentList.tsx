
import React from 'react';
import { Comment } from '@/types/commentTypes';
import { CommentItem } from './CommentItem';
import { Skeleton } from '@/components/ui/skeleton';

interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
  onReply: (comment: Comment) => void;
  onLike: (comment: Comment) => void;
  onDelete: (comment: Comment) => void;
}

export const CommentList = ({
  comments,
  isLoading,
  onReply,
  onLike,
  onDelete
}: CommentListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-20 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <p className="text-muted-foreground">
          Nenhum comentário ainda. Seja o primeiro a compartilhar sua experiência!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map(comment => (
        <CommentItem 
          key={comment.id} 
          comment={comment} 
          onReply={onReply} 
          onLike={onLike} 
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
