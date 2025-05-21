
import { useParams } from 'react-router-dom';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Topic, Post } from '@/types/forumTypes';
import { PostItem } from '@/components/community/PostItem';
import { ReplyForm } from '@/components/forum/ReplyForm';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

const TopicView = () => {
  const { id } = useParams<{ id: string }>();

  const { data: topicData, isLoading: topicLoading } = useQuery({
    queryKey: ['forum-topic', id],
    queryFn: async () => {
      if (!id) return { topic: null, posts: [] };
      
      // Buscar o tópico
      const { data: topic, error: topicError } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles (*),
          category:category_id (name, slug)
        `)
        .eq('id', id)
        .single();
        
      if (topicError) throw topicError;
      
      // Buscar as postagens
      const { data: posts, error: postsError } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles (*)
        `)
        .eq('topic_id', id)
        .order('created_at', { ascending: true });
        
      if (postsError) throw postsError;
      
      return {
        topic: topic as Topic & { profiles: any, category: any },
        posts: posts as Post[]
      };
    },
    enabled: !!id
  });

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="container max-w-7xl mx-auto py-6">
      <ForumBreadcrumbs 
        categoryName={topicData?.topic?.category?.name} 
        categorySlug={topicData?.topic?.category?.slug}
        topicTitle={topicData?.topic?.title}
      />
      
      <CommunityNavigation />
      
      {topicLoading ? (
        <div className="space-y-4 mt-6">
          <Skeleton className="h-8 w-3/4" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-32 w-full" />
        </div>
      ) : topicData?.topic ? (
        <div className="mt-6">
          <h1 className="text-2xl font-bold mb-4">{topicData.topic.title}</h1>
          
          <div className="mb-6 flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={topicData.topic.profiles?.avatar_url || undefined} />
              <AvatarFallback>{getInitials(topicData.topic.profiles?.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{topicData.topic.profiles?.name || 'Usuário'}</p>
              <p className="text-sm text-muted-foreground">
                {topicData.topic.created_at && format(new Date(topicData.topic.created_at), "PPp", { locale: ptBR })}
              </p>
            </div>
          </div>
          
          <div className="prose prose-invert max-w-none mb-10">
            <div dangerouslySetInnerHTML={{ __html: topicData.topic.content }} />
          </div>
          
          <div className="mt-10 space-y-6">
            {topicData.posts.map((post) => (
              <PostItem key={post.id} post={post} topicId={topicData.topic?.id || ''} />
            ))}
          </div>
          
          <div className="mt-10">
            <ReplyForm topicId={topicData.topic.id} />
          </div>
        </div>
      ) : (
        <div className="mt-10 text-center">
          <h2 className="text-xl font-semibold">Tópico não encontrado</h2>
          <p className="text-muted-foreground mt-2">O tópico que você está procurando não existe ou foi removido.</p>
        </div>
      )}
    </div>
  );
};

export default TopicView;
