
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';

interface CommentsListProps {
  comments: any[];
  isLoading: boolean;
}

const CommentsList = ({ comments, isLoading }: CommentsListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4 mt-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 border-white/10 bg-backgroundLight">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2 bg-white/10" />
                <Skeleton className="h-12 w-full bg-white/10" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <Card className="p-8 text-center mt-4 border-dashed border-2 border-aurora-primary/20 bg-aurora-primary/5">
        <MessageSquare className="h-12 w-12 mx-auto text-aurora-primary/40 mb-4" />
        <p className="text-textSecondary">
          Seja o primeiro a comentar.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {comments.map((comment) => {
        const formattedDate = format(
          new Date(comment.created_at),
          "d 'de' MMMM 'às' HH:mm",
          { locale: ptBR }
        );

        return (
          <Card key={comment.id} className="p-4 border-border bg-card hover:border-border transition-colors">
            <div className="flex gap-3">
              <Avatar className="ring-2 ring-aurora-primary/10">
                <AvatarImage src={comment.profiles?.avatar_url || ''} />
                <AvatarFallback className="bg-aurora-primary/10 text-aurora-primary">
                  {comment.profiles?.name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-textPrimary">
                      {comment.profiles?.name || 'Usuário'}
                      {comment.is_official && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-aurora-primary/10 text-aurora-primary rounded-full">
                          Oficial
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-textSecondary">{formattedDate}</p>
                  </div>
                </div>
                <p className="mt-2 whitespace-pre-line text-textPrimary">{comment.content}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default CommentsList;
