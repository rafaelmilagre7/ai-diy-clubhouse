
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';
import { PostItem } from '@/components/community/PostItem';
import { ReplyForm } from '@/components/community/ReplyForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Eye, MessageSquare, CheckCircle, Pin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Topic, Post } from '@/types/forumTypes';

const TopicDetailPage = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Buscar dados do tópico
  const { data: topic, isLoading: topicLoading } = useQuery({
    queryKey: ['forum-topic', topicId],
    queryFn: async (): Promise<Topic | null> => {
      if (!topicId) return null;
      
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            avatar_url,
            role
          ),
          category:forum_categories (
            id,
            name,
            slug
          )
        `)
        .eq('id', topicId)
        .single();
        
      if (error) throw error;
      
      // Incrementar contador de visualizações
      if (user?.id !== data.user_id) {
        await supabase.rpc('increment_topic_views', { topic_id: topicId });
      }
      
      return data;
    },
    enabled: !!topicId
  });

  // Buscar posts/respostas do tópico
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['forum-posts', topicId],
    queryFn: async (): Promise<Post[]> => {
      if (!topicId) return [];
      
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

  // Mutation para marcar como resolvido
  const markAsSolvedMutation = useMutation({
    mutationFn: async (postId: string) => {
      // Primeiro marcar o post como solução
      const { error: postError } = await supabase
        .from('forum_posts')
        .update({ is_solution: true })
        .eq('id', postId);
      
      if (postError) throw postError;
      
      // Depois marcar o tópico como resolvido
      const { error: topicError } = await supabase
        .from('forum_topics')
        .update({ is_solved: true })
        .eq('id', topicId);
        
      if (topicError) throw topicError;
    },
    onSuccess: () => {
      toast.success('Tópico marcado como resolvido!');
      queryClient.invalidateQueries({ queryKey: ['forum-topic', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] });
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
    },
    onError: (error: any) => {
      console.error('Erro ao marcar como resolvido:', error);
      toast.error('Erro ao marcar tópico como resolvido');
    }
  });

  const isLoading = topicLoading || postsLoading;

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-6">
        <CommunityNavigation />
        <div className="mt-6 space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container max-w-7xl mx-auto py-6">
        <CommunityNavigation />
        <div className="mt-6 text-center py-8">
          <h3 className="text-xl font-medium mb-2">Tópico não encontrado</h3>
          <p className="text-muted-foreground mb-4">
            O tópico que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={() => navigate('/comunidade')}>
            Voltar ao fórum
          </Button>
        </div>
      </div>
    );
  }

  const isTopicAuthor = user?.id === topic.user_id;
  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <div className="container max-w-7xl mx-auto py-6">
      <ForumBreadcrumbs 
        categoryName={topic.category?.name} 
        categorySlug={topic.category?.slug}
        topicTitle={topic.title} 
      />
      
      <CommunityNavigation />
      
      {/* Header do tópico */}
      <div className="mt-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/comunidade')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao fórum
          </Button>
        </div>
        
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={topic.profiles?.avatar_url || ''} />
              <AvatarFallback>
                {topic.profiles?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {topic.is_pinned && <Pin className="h-5 w-5 text-primary" />}
                {topic.is_solved && <CheckCircle className="h-5 w-5 text-green-500" />}
                <h1 className="text-2xl font-bold">{topic.title}</h1>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="font-medium">{topic.profiles?.name || 'Usuário'}</span>
                <span>•</span>
                <span>{formatTime(topic.created_at)}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{topic.view_count} visualizações</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{topic.reply_count} respostas</span>
                </div>
              </div>
              
              {topic.category && (
                <Badge variant="secondary" className="mb-4">
                  {topic.category.name}
                </Badge>
              )}
              
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">{topic.content}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Respostas */}
      {posts && posts.length > 0 && (
        <div className="space-y-6 mb-8">
          <h3 className="text-lg font-medium border-b pb-2">
            Respostas ({posts.length})
          </h3>
          {posts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              canMarkAsSolution={isTopicAuthor && !topic.is_solved}
              isAuthor={user?.id === post.user_id}
              onMarkAsSolution={() => markAsSolvedMutation.mutate(post.id)}
              isMarkingSolved={markAsSolvedMutation.isPending}
              topicId={topic.id}
            />
          ))}
        </div>
      )}
      
      {/* Formulário de resposta */}
      {user && !topic.is_locked && (
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-medium mb-4">
            {posts.length > 0 ? 'Adicionar resposta' : 'Seja o primeiro a responder'}
          </h3>
          <ReplyForm 
            topicId={topicId || ''} 
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] });
              queryClient.invalidateQueries({ queryKey: ['forum-topic', topicId] });
            }}
          />
        </div>
      )}
      
      {topic.is_locked && (
        <div className="bg-muted/50 rounded-lg border p-6 text-center">
          <p className="text-muted-foreground">
            Este tópico foi bloqueado e não aceita mais respostas.
          </p>
        </div>
      )}
      
      {!user && (
        <div className="bg-muted/50 rounded-lg border p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Você precisa estar logado para responder a este tópico.
          </p>
          <Button onClick={() => navigate('/login')}>
            Fazer Login
          </Button>
        </div>
      )}
    </div>
  );
};

export default TopicDetailPage;
