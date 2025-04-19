
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface CommentsListProps {
  comments: any[];
  isLoading: boolean;
}

const CommentsList = ({ comments, isLoading }: CommentsListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4 mt-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">Seja o primeiro a comentar.</p>
      </div>
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
          <Card key={comment.id} className="p-4">
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src={comment.profiles?.avatar_url || ''} />
                <AvatarFallback>
                  {comment.profiles?.name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">
                      {comment.profiles?.name || 'Usuário'}
                      {comment.is_official && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                          Oficial
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{formattedDate}</p>
                  </div>
                </div>
                <p className="mt-2 whitespace-pre-line">{comment.content}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default CommentsList;
