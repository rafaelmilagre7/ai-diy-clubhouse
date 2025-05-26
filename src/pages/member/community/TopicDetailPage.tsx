
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { ForumHeader } from '@/components/community/ForumHeader';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { PostItem } from '@/components/community/PostItem';
import { ReplyForm } from '@/components/community/ReplyForm';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';
import { Topic, Post } from '@/types/forumTypes';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const TopicDetailPage = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const { user } = useAuth();
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
      await supabase.rpc('increment_topic_views', { topic_id: topicId });
      
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
    onError: (error: any) => {
      console.error('Erro ao marcar como resolvido:', error);
      toast.error('Erro ao marcar tópico como resolvido');
    }
  });

  const isLoading = topicLoading || postsLoading;

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-6">
        <div className="animate-pulse space-y-4">
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
        <div className="text-center py-8">
          <h3 className="text-xl font-medium mb-2">Tópico não encontrado</h3>
          <p className="text-muted-foreground">
            O tópico que você está procurando não existe ou foi removido.
          </p>
        </div>
      </div>
    );
  }

  const isTopicAuthor = user?.id === topic.user_id;

  return (
    <div className="container max-w-7xl mx-auto py-6">
      <ForumBreadcrumbs 
        categoryName={topic.category?.name} 
        categorySlug={topic.category?.slug}
        topicTitle={topic.title} 
      />
      
      <ForumHeader
        title={topic.title}
        description={`Tópico iniciado por ${topic.profiles?.name || 'Usuário'}`}
        showNewTopicButton={false}
      />
      
      <CommunityNavigation />
      
      <div className="mt-6 space-y-6">
        {/* Post principal (conteúdo do tópico) */}
        <PostItem
          post={{
            id: topic.id,
            content: topic.content,
            user_id: topic.user_id,
            topic_id: topic.id,
            created_at: topic.created_at,
            updated_at: topic.updated_at,
            profiles: topic.profiles,
            is_solution: false
          }}
          canMarkAsSolution={false}
          isAuthor={isTopicAuthor}
          onMarkAsSolution={() => {}}
          isMarkingSolved={false}
          topicId={topic.id}
        />
        
        {/* Respostas ao tópico */}
        {posts && posts.length > 0 && (
          <div className="space-y-6">
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
        {user && (
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Responder</h3>
            <ReplyForm topicId={topicId || ''} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicDetailPage;
