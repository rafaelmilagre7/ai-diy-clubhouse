
import React from 'react';
import { Comment } from '@/types/commentTypes';
import { CommentItem } from './CommentItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

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
          <Card key={i} className="p-4">
            <div className="flex gap-4">
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
          </Card>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed border-2 border-viverblue/20 bg-viverblue/5">
        <MessageSquare className="h-12 w-12 mx-auto text-viverblue/40 mb-4" />
        <p className="text-muted-foreground">
          Nenhum comentário ainda. Seja o primeiro a compartilhar sua experiência!
        </p>
      </Card>
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
