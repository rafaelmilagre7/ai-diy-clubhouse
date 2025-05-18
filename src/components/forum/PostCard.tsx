
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from '@/components/ui/separator';
import { ForumPostWithMeta } from '@/lib/supabase/types/forum.types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, MessageSquare, ThumbsUp, Award } from 'lucide-react';
import { useForumActions } from '@/hooks/forum/useForumActions';
import { PostForm } from './PostForm';
import { useAuth } from '@/contexts/auth';

interface PostCardProps {
  post: ForumPostWithMeta;
  topicId: string;
  isSolution?: boolean;
  isAuthorOrAdmin: boolean;
  onMarkSolution?: (postId: string, isSolution: boolean) => void;
}

export const PostCard = ({ 
  post, 
  topicId,
  isSolution = false,
  isAuthorOrAdmin,
  onMarkSolution
}: PostCardProps) => {
  const { isAuthenticated } = useAuth();
  const { toggleReaction } = useForumActions();
  const [showReplyForm, setShowReplyForm] = useState(false);

  // Obter as iniciais do nome do autor para o avatar fallback
  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleReaction = () => {
    if (!isAuthenticated) return;
    
    toggleReaction.mutate({
      postId: post.id,
      reactionType: 'like',
      active: !post.reactions?.user_reacted
    });
  };

  const handleMarkSolution = () => {
    if (onMarkSolution) {
      onMarkSolution(post.id, !post.is_solution);
    }
  };

  const relativeTime = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ptBR
  });

  return (
    <Card className={`mb-4 ${post.is_solution ? 'border-green-500 shadow-green-100' : ''}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={post.author?.avatar_url || undefined} />
            <AvatarFallback>{getInitials(post.author?.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{post.author?.name || 'Anônimo'}</p>
            <p className="text-xs text-muted-foreground">{relativeTime}</p>
          </div>
        </div>
        
        {post.is_solution && (
          <div className="flex items-center text-green-600">
            <Award className="mr-1 h-5 w-5" />
            <span className="text-sm font-medium">Solução</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-2">
        <div 
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4 pt-0">
        <div className="flex w-full justify-between items-center">
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center text-muted-foreground"
              onClick={handleReaction}
              disabled={!isAuthenticated}
            >
              <ThumbsUp 
                className={`mr-1 h-4 w-4 ${post.reactions?.user_reacted ? 'fill-current text-primary' : ''}`} 
              />
              {post.reactions?.count || 0}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center text-muted-foreground"
              onClick={() => setShowReplyForm(!showReplyForm)}
              disabled={!isAuthenticated}
            >
              <MessageSquare className="mr-1 h-4 w-4" />
              Responder
            </Button>
          </div>
          
          {isAuthorOrAdmin && !post.parent_id && (
            <Button 
              variant={post.is_solution ? "outline" : "secondary"} 
              size="sm"
              onClick={handleMarkSolution}
            >
              <Check className="mr-1 h-4 w-4" />
              {post.is_solution ? 'Desmarcar Solução' : 'Marcar como Solução'}
            </Button>
          )}
        </div>
        
        {showReplyForm && (
          <div className="w-full">
            <Separator className="my-2" />
            <PostForm 
              topicId={topicId} 
              parentId={post.id}
              onSuccess={() => setShowReplyForm(false)}
              placeholder="Escreva sua resposta..."
              buttonText="Responder"
            />
          </div>
        )}
        
        {/* Exibir respostas */}
        {post.replies && post.replies.length > 0 && (
          <div className="w-full pt-2 space-y-3">
            <Separator />
            <h4 className="text-sm font-medium pt-2">Respostas ({post.replies.length})</h4>
            
            <div className="space-y-4 ml-4 pl-4 border-l-2 border-muted">
              {post.replies.map(reply => (
                <div key={reply.id} className="pt-2">
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={reply.author?.avatar_url || undefined} />
                      <AvatarFallback>{getInitials(reply.author?.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{reply.author?.name || 'Anônimo'}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <div 
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: reply.content }}
                    />
                  </div>
                  
                  <div className="mt-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center text-muted-foreground h-8 px-2"
                      onClick={() => toggleReaction.mutate({
                        postId: reply.id,
                        reactionType: 'like',
                        active: !reply.reactions?.user_reacted
                      })}
                      disabled={!isAuthenticated}
                    >
                      <ThumbsUp 
                        className={`mr-1 h-3 w-3 ${reply.reactions?.user_reacted ? 'fill-current text-primary' : ''}`} 
                      />
                      {reply.reactions?.count || 0}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
