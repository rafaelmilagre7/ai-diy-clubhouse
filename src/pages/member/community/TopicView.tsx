
import { useParams } from 'react-router-dom';
import { useTopicDetails } from '@/hooks/community/useTopicDetails';
import { ForumHeader } from '@/components/community/ForumHeader';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { PostItem } from '@/components/community/PostItem';
import { ReplyForm } from '@/components/community/ReplyForm';
import { ForumLayout } from '@/components/community/ForumLayout';
import { useAuth } from '@/contexts/auth';

const TopicView = () => {
  const { id: topicId } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const {
    topic,
    posts,
    isLoading,
    error,
    markAsSolved,
    isMarkingSolved
  } = useTopicDetails(topicId || '');

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-800 rounded w-1/3"></div>
          <div className="h-32 bg-neutral-800 rounded"></div>
          <div className="h-24 bg-neutral-800 rounded"></div>
          <div className="h-24 bg-neutral-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !topic) {
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
      
      <ForumLayout>
        <div className="space-y-6">
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
            <div className="mt-6 space-y-6">
              <h3 className="text-lg font-medium border-b pb-2">
                Respostas ({posts.length})
              </h3>
              {posts.map((post) => (
                <PostItem
                  key={post.id}
                  post={post}
                  canMarkAsSolution={isTopicAuthor && !topic.is_solved}
                  isAuthor={user?.id === post.user_id}
                  onMarkAsSolution={() => markAsSolved(post.id)}
                  isMarkingSolved={isMarkingSolved}
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
      </ForumLayout>
    </div>
  );
};

export default TopicView;
