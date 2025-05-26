
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ForumHeader } from '@/components/community/ForumHeader';
import { PostItem } from '@/components/community/PostItem';
import { ReplyForm } from '@/components/community/ReplyForm';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';
import { incrementTopicViews } from '@/lib/supabase';
import { Post, Topic } from '@/types/forumTypes';

const TopicDetail = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [categorySlug, setCategorySlug] = useState<string | undefined>();
  
  // Buscar detalhes do tópico
  const {
    data: topic,
    isLoading: topicLoading,
  } = useQuery({
    queryKey: ['topic', topicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles (*),
          category:category_id (*)
        `)
        .eq('id', topicId)
        .single();

      if (error) throw error;
      
      // Incrementar visualização
      if (data) {
        await incrementTopicViews(data.id);
        
        // Salvar slug da categoria para breadcrumbs
        if (data.category) {
          setCategorySlug(data.category.slug);
        }
      }
      
      return data as Topic;
    },
    enabled: !!topicId
  });

  // Buscar respostas do tópico
  const {
    data: posts,
    isLoading: postsLoading,
  } = useQuery({
    queryKey: ['topic-posts', topicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles (*),
          replies:forum_posts!parent_id (
            *,
            profiles (*)
          )
        `)
        .eq('topic_id', topicId)
        .is('parent_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Post[];
    },
    enabled: !!topicId
  });

  const isLoading = topicLoading || postsLoading;

  // Implementação básica para refresh depois de resposta
  const [refreshKey, setRefreshKey] = useState(0);
  const handlePostCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Atualizar visualização
  useEffect(() => {
    if (topicId) {
      incrementTopicViews(topicId).catch(console.error);
    }
  }, [topicId]);

  return (
    <div className="container max-w-7xl mx-auto py-6">
      <ForumBreadcrumbs 
        categorySlug={categorySlug} 
        topicTitle={topic?.title}
      />
      
      {!isLoading && topic && (
        <>
          <ForumHeader
            title={topic.title}
            showNewTopicButton={false}
          />
          
          <CommunityNavigation />
          
          <div className="space-y-6 pb-10">
            {/* Conteúdo original do tópico */}
            <PostItem 
              post={{
                id: topic.id,
                content: topic.content,
                user_id: topic.user_id,
                created_at: topic.created_at,
                updated_at: topic.updated_at,
                profiles: topic.profiles,
                is_solution: false,
                topic_id: topic.id
              }}
              isTopicStarter
              topicAuthorId={topic.user_id}
              isSolved={topic.is_solved}
            />
            
            {/* Respostas ao tópico */}
            {posts && posts.map(post => (
              <PostItem
                key={post.id}
                post={post}
                topicAuthorId={topic.user_id}
                isSolved={topic.is_solved}
              />
            ))}
            
            {/* Formulário de resposta */}
            <div className="mt-8">
              <ReplyForm 
                topicId={topic.id} 
                onPostCreated={handlePostCreated} 
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TopicDetail;
