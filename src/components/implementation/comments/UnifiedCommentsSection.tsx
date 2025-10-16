import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { MessageSquare, Send, Reply, X, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  profiles: {
    id: string;
    name: string;
    email: string;
  } | null;
  replies?: Comment[];
}

interface UnifiedCommentsSectionProps {
  solutionId: string;
  moduleId?: string;
}

export const UnifiedCommentsSection: React.FC<UnifiedCommentsSectionProps> = ({ 
  solutionId, 
  moduleId 
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Buscar comentários
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['solution-comments', solutionId],
    queryFn: async () => {
      // Buscar comentários da tabela solution_comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('solution_comments')
        .select('*')
        .eq('solution_id', solutionId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;
      
      if (!commentsData || commentsData.length === 0) return [];

      // Buscar perfis dos usuários
      const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds);

      if (profilesError) throw profilesError;
      
      // Mapear comentários com perfis
      const commentsWithProfiles = commentsData.map(comment => ({
        ...comment,
        profiles: profilesData?.find(profile => profile.id === comment.user_id) || null
      }));
      
      // Organizar em threads
      const mainComments = commentsWithProfiles.filter(comment => !comment.parent_id);
      const replies = commentsWithProfiles.filter(comment => comment.parent_id);
      
      return mainComments.map(comment => ({
        ...comment,
        replies: replies.filter(reply => reply.parent_id === comment.id)
      }));
    },
    staleTime: 30000,
    retry: 1
  });

  // Adicionar comentário
  const addCommentMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('solution_comments')
        .insert({
          solution_id: solutionId,
          user_id: user.id,
          content: content.trim(),
          parent_id: parentId || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solution-comments', solutionId] });
      setNewComment('');
      setReplyContent('');
      setReplyingTo(null);
      toast.success('Comentário adicionado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao adicionar comentário:', error);
      toast.error('Erro ao adicionar comentário');
    }
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate({ content: newComment });
    }
  };

  const handleSubmitReply = (parentId: string) => {
    if (replyContent.trim()) {
      addCommentMutation.mutate({ content: replyContent, parentId });
    }
  };

  const startReply = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyContent('');
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyContent('');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="h-5 w-5 text-aurora-primary" />
          <h3 className="text-lg font-semibold">Comentários</h3>
        </div>
        
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-4 bg-backgroundLight border-white/10">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-32 bg-white/10" />
                <Skeleton className="h-20 w-full bg-white/10" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-aurora-primary" />
        <h3 className="text-lg font-semibold text-textPrimary">
          Comentários ({comments.length})
        </h3>
      </div>

      {/* Formulário de novo comentário */}
      <Card className="p-4 bg-backgroundLight border-white/10">
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Compartilhe sua experiência, dúvidas ou dicas sobre esta solução..."
            className="min-h-24 resize-y bg-card border-border text-textPrimary focus-visible:ring-aurora-primary"
          />
          
          <div className="flex justify-end">
            <Button 
              type="submit"
              variant="aurora-primary"
              disabled={!newComment.trim() || addCommentMutation.isPending}
            >
              {addCommentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Comentário
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Lista de comentários */}
      {comments.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-2 border-aurora-primary/20 bg-aurora-primary/5">
          <MessageSquare className="h-12 w-12 mx-auto text-aurora-primary/40 mb-4" />
          <p className="text-textSecondary">
            Seja o primeiro a comentar sobre esta solução!
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <Card key={comment.id} className="p-4 bg-backgroundLight border-white/10">
              <div className="space-y-4">
                {/* Comentário principal */}
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-aurora-primary/10 text-aurora-primary">
                      {comment.profiles?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-textPrimary">
                          {comment.profiles?.name || 'Usuário'}
                        </h4>
                        <p className="text-xs text-textSecondary">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startReply(comment.id)}
                        className="text-textSecondary hover:text-aurora-primary hover:bg-aurora-primary/10"
                      >
                        <Reply className="h-4 w-4 mr-1" />
                        Responder
                      </Button>
                    </div>
                    
                    <p className="text-sm text-textPrimary whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>

                {/* Formulário de resposta */}
                {replyingTo === comment.id && (
                  <div className="ml-14 space-y-3 p-3 bg-aurora-primary/5 rounded-md border border-aurora-primary/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-textPrimary">
                        Respondendo para {comment.profiles?.name || 'Usuário'}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={cancelReply}
                        className="h-6 w-6 p-0 hover:bg-aurora-primary/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Escreva sua resposta..."
                      className="min-h-20 bg-card border-border text-textPrimary focus-visible:ring-aurora-primary"
                    />
                    
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={cancelReply}>
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        variant="aurora-primary"
                        onClick={() => handleSubmitReply(comment.id)}
                        disabled={!replyContent.trim() || addCommentMutation.isPending}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Responder
                      </Button>
                    </div>
                  </div>
                )}

                {/* Respostas */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-14 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="p-3 bg-backgroundDark/50 rounded-md border border-white/5">
                        <div className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-aurora-primary/10 text-aurora-primary text-xs">
                              {reply.profiles?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-medium text-textPrimary">
                                {reply.profiles?.name || 'Usuário'}
                              </h5>
                              <span className="text-xs text-textSecondary">
                                {formatDistanceToNow(new Date(reply.created_at), {
                                  addSuffix: true,
                                  locale: ptBR
                                })}
                              </span>
                            </div>
                            
                            <p className="text-sm text-textPrimary whitespace-pre-wrap">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};