
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { Post } from '@/types/forumTypes';
import { ReplyItem } from './ReplyItem';
import { Skeleton } from '@/components/ui/skeleton';

interface TopicRepliesListProps {
  topicId: string;
}

export const TopicRepliesList: React.FC<TopicRepliesListProps> = ({ topicId }) => {
  const { data: replies = [], isLoading, error, refetch } = useQuery({
    queryKey: ['forum-replies', topicId],
    queryFn: async (): Promise<Post[]> => {
      console.log('Buscando respostas para tópico:', topicId);
      
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            avatar_url,
            role
          )
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error('Erro ao buscar respostas:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!topicId
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Respostas</h3>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar respostas. Tente novamente mais tarde.
        </AlertDescription>
      </Alert>
    );
  }

  if (replies.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma resposta ainda</h3>
          <p className="text-muted-foreground">
            Seja o primeiro a responder este tópico!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        Respostas ({replies.length})
      </h3>
      
      <div className="space-y-4">
        {replies.map((reply) => (
          <ReplyItem 
            key={reply.id} 
            reply={reply} 
            topicId={topicId}
            onReplyDeleted={refetch}
          />
        ))}
      </div>
    </div>
  );
};
