
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, MessageSquare, Eye, CheckCircle, Pin, Lock, MoreHorizontal, Trash2, Edit, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Topic, Post } from '@/types/forumTypes';
import { getInitials } from '@/utils/user';

const TopicDetailPage = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Buscar dados do tópico
  const { data: topic, isLoading: topicLoading, error: topicError } = useQuery({
    queryKey: ['forum-topic', topicId],
    queryFn: async () => {
      if (!topicId) throw new Error('ID do tópico não fornecido');

      // Primeiro, incrementar view count
      await supabase.rpc('increment_topic_views', { topic_id: topicId });

      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles:profiles!forum_topics_user_id_fkey (
            id,
            name,
            avatar_url,
            role
          ),
          forum_categories:forum_categories!forum_topics_category_id_fkey (
            id,
            name,
            slug
          )
        `)
        .eq('id', topicId)
        .single();

      if (error) throw error;
      return data as Topic;
    },
    enabled: !!topicId
  });

  // Buscar posts do tópico
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['forum-posts', topicId],
    queryFn: async () => {
      if (!topicId) return [];

      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:profiles!forum_posts_user_id_fkey (
            id,
            name,
            avatar_url,
            role
          )
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Post[];
    },
    enabled: !!topicId
  });

  // Mutation para criar resposta
  const createReplyMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id || !topicId) throw new Error('Dados insuficientes');

      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          content: content.trim(),
          topic_id: topicId,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      // Incrementar contador de respostas
      await supabase.rpc('increment_topic_replies', { topic_id: topicId });
      
      return data;
    },
    onSuccess: () => {
      setReplyContent('');
      toast.success('Resposta enviada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-topic', topicId] });
    },
    onError: (error) => {
      console.error('Erro ao enviar resposta:', error);
      toast.error('Erro ao enviar resposta');
    }
  });

  // Mutation para marcar como resolvido
  const markSolvedMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { data, error } = await supabase.rpc('mark_topic_solved', {
        p_topic_id: topicId,
        p_post_id: postId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Tópico marcado como resolvido!');
      queryClient.invalidateQueries({ queryKey: ['forum-topic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] });
    },
    onError: () => {
      toast.error('Erro ao marcar como resolvido');
    }
  });

  // Mutation para deletar post
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { data, error } = await supabase.rpc('deleteforumpost', {
        post_id: postId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Post excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-topic', topicId] });
    },
    onError: () => {
      toast.error('Erro ao excluir post');
    }
  });

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) {
      toast.error('Por favor, digite uma resposta');
      return;
    }

    setIsSubmittingReply(true);
    try {
      await createReplyMutation.mutateAsync(replyContent);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const isTopicAuthor = user?.id === topic?.user_id;
  const isAdmin = user && ['admin'].includes(user.role || '');

  if (topicLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-800 rounded w-1/3"></div>
          <div className="h-8 bg-neutral-800 rounded"></div>
          <div className="h-32 bg-neutral-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (topicError || !topic) {
    return (
      <div className="container max-w-7xl mx-auto py-6">
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold mb-4">Tópico não encontrado</h1>
          <p className="text-muted-foreground mb-6">O tópico que você está procurando não existe ou foi removido.</p>
          <Button asChild>
            <Link to="/comunidade">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à comunidade
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-6">
      <ForumBreadcrumbs 
        categoryName={topic.category?.name}
        categorySlug={topic.category?.slug}
        topicTitle={topic.title}
      />

      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/comunidade')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
      </div>

      <CommunityNavigation />

      <div className="mt-6 space-y-6">
        {/* Cabeçalho do Tópico */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {topic.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                    {topic.is_locked && <Lock className="h-4 w-4 text-muted-foreground" />}
                    {topic.is_solved && <CheckCircle className="h-4 w-4 text-green-500" />}
                    <h1 className="text-2xl font-bold">{topic.title}</h1>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{topic.view_count} visualizações</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{topic.reply_count} respostas</span>
                    </div>
                    {topic.category && (
                      <Badge variant="secondary">{topic.category.name}</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={topic.profiles?.avatar_url || ''} />
                    <AvatarFallback>
                      {getInitials(topic.profiles?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{topic.profiles?.name || 'Usuário'}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(topic.created_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{topic.content}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Respostas */}
        {postsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 bg-neutral-800 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-neutral-800 rounded w-1/4"></div>
                      <div className="h-16 bg-neutral-800 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Respostas ({posts.length})</h3>
            {posts.map((post, index) => (
              <Card key={post.id} className={post.is_solution ? 'border-green-200 bg-green-50/30' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 flex-1">
                      <Avatar>
                        <AvatarImage src={post.profiles?.avatar_url || ''} />
                        <AvatarFallback>
                          {getInitials(post.profiles?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium">{post.profiles?.name || 'Usuário'}</p>
                          {post.is_solution && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Solução
                            </Badge>
                          )}
                          <span className="text-sm text-muted-foreground">
                            #{index + 1} • {formatDistanceToNow(new Date(post.created_at), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </span>
                        </div>
                        <div className="prose prose-neutral dark:prose-invert max-w-none">
                          <p className="whitespace-pre-wrap">{post.content}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {(isTopicAuthor || isAdmin) && !topic.is_solved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markSolvedMutation.mutate(post.id)}
                          disabled={markSolvedMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Marcar como solução
                        </Button>
                      )}
                      
                      {(user?.id === post.user_id || isAdmin) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir resposta</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir esta resposta? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deletePostMutation.mutate(post.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Nenhuma resposta ainda</p>
              <p className="text-muted-foreground">Seja o primeiro a responder este tópico!</p>
            </CardContent>
          </Card>
        )}

        {/* Formulário de Resposta */}
        {user && !topic.is_locked && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Sua resposta</h3>
              <form onSubmit={handleSubmitReply} className="space-y-4">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Digite sua resposta..."
                  rows={4}
                  required
                />
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isSubmittingReply || !replyContent.trim()}
                  >
                    {isSubmittingReply ? 'Enviando...' : 'Enviar resposta'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {topic.is_locked && (
          <Card className="border-yellow-200 bg-yellow-50/30">
            <CardContent className="p-6 text-center">
              <Lock className="h-12 w-12 mx-auto text-yellow-600 mb-4" />
              <p className="text-lg font-medium mb-2">Tópico trancado</p>
              <p className="text-muted-foreground">Este tópico foi trancado e não aceita novas respostas.</p>
            </CardContent>
          </Card>
        )}

        {!user && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-lg font-medium mb-4">Faça login para participar</p>
              <p className="text-muted-foreground mb-4">Você precisa estar logado para responder este tópico.</p>
              <Button asChild>
                <Link to="/login">Fazer login</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TopicDetailPage;
