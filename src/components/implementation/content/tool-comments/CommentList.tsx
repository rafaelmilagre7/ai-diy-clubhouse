
import React from 'react';
import { Comment } from '@/types/commentTypes';
import { CommentItem } from './CommentItem';
import { Loader2, MessageSquare } from 'lucide-react';

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
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed rounded-md">
        <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
        <h3 className="text-lg font-medium">Nenhum comentário ainda</h3>
        <p className="text-muted-foreground mt-1">
          Seja o primeiro a comentar sobre esta solução
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
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
