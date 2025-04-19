
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { MessageCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    name?: string;
    avatar_url?: string;
  };
}

interface CommentsListProps {
  comments: Comment[];
  isLoading: boolean;
}

const CommentsList = ({ comments, isLoading }: CommentsListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed rounded-lg">
        <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">Nenhum comentário ainda</h3>
        <p className="text-muted-foreground text-sm">Seja o primeiro a comentar nesta sugestão.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.user?.avatar_url || ''} />
                <AvatarFallback>{comment.user?.name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm">{comment.user?.name || 'Usuário'}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {format(new Date(comment.created_at), "dd/MM/yyyy HH:mm")}
            </span>
          </div>
          <p className="text-sm whitespace-pre-line">{comment.content}</p>
        </div>
      ))}
    </div>
  );
};

export default CommentsList;
