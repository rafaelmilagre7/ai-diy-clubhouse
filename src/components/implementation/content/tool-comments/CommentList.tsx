
import React from 'react';
import { Comment } from '@/types/commentTypes';
import { CommentItem } from './CommentItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { AlertTriangle, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
  error?: Error | null;
  onReply: (comment: Comment) => void;
  onLike: (comment: Comment) => void;
  onDelete: (comment: Comment) => void;
}

export const CommentList = ({
  comments,
  isLoading,
  error,
  onReply,
  onLike,
  onDelete
}: CommentListProps) => {
  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-950/50 border-red-800/50">
        <AlertTriangle className="h-4 w-4 text-red-400" />
        <AlertDescription className="text-red-200">
          Erro ao carregar comentários: {error.message || "Ocorreu um erro inesperado"}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-4 border-white/5 bg-backgroundLight">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-32 bg-white/10" />
                <Skeleton className="h-20 w-full bg-white/10" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16 bg-white/10" />
                  <Skeleton className="h-8 w-20 bg-white/10" />
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
        <p className="text-textSecondary">
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
