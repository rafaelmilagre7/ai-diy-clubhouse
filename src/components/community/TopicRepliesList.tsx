
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getInitials } from '@/utils/user';
import { useAuth } from '@/contexts/auth';
import { 
  MessageSquare, 
  ThumbsUp, 
  MoreHorizontal,
  CheckCircle,
  Flag,
  Edit,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Topic, Post } from '@/types/forumTypes';

interface TopicRepliesListProps {
  topicId: string;
  topic: Topic;
}

export const TopicRepliesList: React.FC<TopicRepliesListProps> = ({ topicId, topic }) => {
  const { user } = useAuth();
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['forum-posts', topicId],
    queryFn: async (): Promise<Post[]> => {
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
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!topicId
  });

  const formatDate = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return 'Data inválida';
    }
  };

  const toggleReplyExpansion = (postId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedReplies(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const mainPosts = posts.filter(post => !post.parent_id);
  const replies = posts.filter(post => post.parent_id);

  if (posts.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma resposta ainda
          </h3>
          <p className="text-muted-foreground">
            Seja o primeiro a responder este tópico e iniciar a discussão!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Respostas ({posts.length})
        </h3>
      </div>

      {mainPosts.map((post) => {
        const postReplies = replies.filter(reply => reply.parent_id === post.id);
        const isExpanded = expandedReplies.has(post.id);
        const isAuthor = user?.id === post.user_id;
        const isAdmin = user?.role === 'admin';

        return (
          <Card key={post.id} className="overflow-hidden">
            <CardContent className="p-6">
              {/* Post principal */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.profiles?.avatar_url || ''} />
                      <AvatarFallback>
                        {getInitials(post.profiles?.name || 'Usuário')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{post.profiles?.name || 'Usuário'}</span>
                        {post.profiles?.role === 'admin' && (
                          <Badge variant="secondary" className="text-xs">Admin</Badge>
                        )}
                        {post.is_solution && (
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Solução
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {formatDate(post.created_at)}
                        </span>
                      </div>
                      
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap text-gray-900">{post.content}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu de ações */}
                  {user && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!topic.is_solved && isAuthor && topic.user_id === user.id && (
                          <DropdownMenuItem className="text-green-600">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marcar como solução
                          </DropdownMenuItem>
                        )}
                        {(isAuthor || isAdmin) && (
                          <DropdownMenuItem className="text-blue-600">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar resposta
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-yellow-600">
                          <Flag className="h-4 w-4 mr-2" />
                          Reportar resposta
                        </DropdownMenuItem>
                        {(isAuthor || isAdmin) && (
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Deletar resposta
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Ações do post */}
                <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Útil
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground"
                    onClick={() => toggleReplyExpansion(post.id)}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Responder
                  </Button>

                  {postReplies.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => toggleReplyExpansion(post.id)}
                    >
                      {isExpanded ? 'Ocultar' : 'Ver'} {postReplies.length} respostas
                    </Button>
                  )}
                </div>

                {/* Respostas aninhadas */}
                {isExpanded && postReplies.length > 0 && (
                  <div className="ml-8 space-y-4 pt-4 border-t border-gray-100">
                    {postReplies.map((reply) => (
                      <div key={reply.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={reply.profiles?.avatar_url || ''} />
                          <AvatarFallback className="text-xs">
                            {getInitials(reply.profiles?.name || 'Usuário')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{reply.profiles?.name || 'Usuário'}</span>
                            {reply.profiles?.role === 'admin' && (
                              <Badge variant="secondary" className="text-xs">Admin</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDate(reply.created_at)}
                            </span>
                          </div>
                          
                          <div className="prose prose-sm max-w-none">
                            <p className="text-sm whitespace-pre-wrap text-gray-900">{reply.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
