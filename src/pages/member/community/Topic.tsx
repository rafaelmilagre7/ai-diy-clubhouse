
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ForumHeader } from '@/components/community/ForumHeader';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { Topic, Post } from '@/types/forumTypes';
import { PostItem } from '@/components/community/PostItem';
import { Button } from '@/components/ui/button';
import { ReplyForm } from '@/components/community/ReplyForm';
import { ForumLayout } from '@/components/community/ForumLayout';

const TopicPage = () => {
  const { topicId } = useParams<{ topicId: string }>();

  // Buscar dados do tópico
  const { data: topic, isLoading: topicLoading } = useQuery({
    queryKey: ['forum-topic', topicId],
    queryFn: async () => {
      if (!topicId) return null;
      
      const { data, error } = await supabase
        .from('forum_topics')
        .select('*, profiles(*), category:forum_categories(*)')
        .eq('id', topicId)
        .single();
        
      if (error) throw error;
      
      // Incrementar contador de visualizações
      await supabase
        .from('forum_topics')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', topicId);
      
      return data as Topic;
    },
    enabled: !!topicId
  });

  // Buscar posts/respostas do tópico
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['forum-posts', topicId],
    queryFn: async () => {
      if (!topicId) return [];
      
      const { data, error } = await supabase
        .from('forum_posts')
        .select('*, profiles(*)')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      return data as Post[];
    },
    enabled: !!topicId
  });

  const isLoading = topicLoading || postsLoading;

  return (
    <div className="container max-w-7xl mx-auto py-6">
      <ForumBreadcrumbs 
        categoryName={topic?.category?.name} 
        categorySlug={topic?.category?.slug}
        topicTitle={topic?.title} 
      />
      
      <ForumHeader
        title={topic?.title || 'Carregando...'}
        description={`Tópico iniciado por ${topic?.profiles?.name || 'Usuário'}`}
      />
      
      <ForumLayout>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-neutral-800 rounded"></div>
            <div className="h-24 bg-neutral-800 rounded"></div>
            <div className="h-24 bg-neutral-800 rounded"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Conteúdo do tópico como primeiro post */}
            {topic && (
              <PostItem
                content={topic.content}
                createdAt={topic.created_at}
                user={topic.profiles}
                isTopicStarter={true}
              />
            )}
            
            {/* Respostas ao tópico */}
            {posts && posts.length > 0 && (
              <div className="mt-6 space-y-6">
                <h3 className="text-lg font-medium border-b pb-2">
                  Respostas ({posts.length})
                </h3>
                {posts.map((post) => (
                  <PostItem
                    key={post.id}
                    content={post.content}
                    createdAt={post.created_at}
                    user={post.profiles}
                    isTopicStarter={false}
                  />
                ))}
              </div>
            )}
            
            {/* Formulário de resposta */}
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Responder</h3>
              <ReplyForm topicId={topicId || ''} />
            </div>
          </div>
        )}
      </ForumLayout>
    </div>
  );
};

export default TopicPage;
