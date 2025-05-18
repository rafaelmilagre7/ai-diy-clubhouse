
import React from 'react';
import { useParams } from 'react-router-dom';
import { ForumHeader } from "@/components/forum/ForumHeader";
import { PostCard } from '@/components/forum/PostCard';
import { PostForm } from '@/components/forum/PostForm';
import { useForumTopic } from '@/hooks/forum/useForumTopic';
import { useForumPosts } from '@/hooks/forum/useForumPosts';
import { useForumActions } from '@/hooks/forum/useForumActions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth';
import { Separator } from '@/components/ui/separator';
import { Eye, MessageCircle } from 'lucide-react';

export const TopicPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: topic, isLoading: loadingTopic } = useForumTopic(id);
  const { data: posts = [], isLoading: loadingPosts } = useForumPosts(id);
  const { markAsSolution } = useForumActions();
  const { profile } = useAuth();
  
  const isAdmin = profile?.role === 'admin';
  const isTopicAuthor = topic?.user_id === profile?.id;
  const isAuthorOrAdmin = isAdmin || isTopicAuthor;

  const handleMarkSolution = (postId: string, isSolution: boolean) => {
    if (id) {
      markAsSolution.mutate({
        postId,
        topicId: id,
        isSolution
      });
    }
  };
  
  const renderTopicSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/2 mb-2" />
      <Skeleton className="h-6 w-2/3 mb-8" />
      
      <div className="flex items-center space-x-3 mb-6">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      
      <Skeleton className="h-40 w-full" />
      
      <div className="flex justify-between items-center mt-4">
        <div className="flex space-x-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>
  );
  
  const renderPostsSkeleton = () => (
    <div className="space-y-6 mt-8">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="mb-4">
          <CardHeader className="flex flex-row items-start space-y-0 pb-2">
            <div className="flex items-center">
              <Skeleton className="h-8 w-8 rounded-full mr-2" />
              <div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-2">
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
  
  if (loadingTopic) {
    return (
      <div className="container py-8">
        {renderTopicSkeleton()}
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Tópico não encontrado</CardTitle>
            <CardDescription>
              O tópico que você está procurando não existe ou foi removido.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <ForumHeader 
        title={topic.title}
        breadcrumbs={[
          { name: 'Categorias', href: '/forum' },
          { name: topic.category?.name || 'Categoria', href: `/forum/categoria/${topic.category?.slug}` },
          { name: topic.title, href: `/forum/topico/${topic.id}` }
        ]}
      />
      
      <div className="space-y-6">
        {/* Tópico principal */}
        <Card>
          <CardContent className="pt-6">
            {/* Conteúdo do tópico */}
            <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
              <div dangerouslySetInnerHTML={{ __html: topic.content }} />
            </div>
            
            {/* Meta informações */}
            <div className="flex flex-wrap gap-4 items-center text-sm text-muted-foreground mt-6">
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {topic.view_count} visualizações
              </div>
              
              <div className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-1" />
                {topic.reply_count} respostas
              </div>
              
              {topic.is_locked && (
                <div className="text-red-500">
                  Este tópico está bloqueado para novas respostas.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Respostas */}
        <div>
          <h3 className="text-lg font-medium mb-4">
            Respostas ({posts.length})
          </h3>
          
          {loadingPosts ? (
            renderPostsSkeleton()
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  topicId={topic.id} 
                  isAuthorOrAdmin={isAuthorOrAdmin}
                  onMarkSolution={handleMarkSolution}
                />
              ))}
              
              {posts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Ainda não há respostas para este tópico. Seja o primeiro a responder!
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Formulário de resposta */}
        {!topic.is_locked && profile && (
          <>
            <Separator />
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Sua resposta</h3>
              <PostForm 
                topicId={topic.id} 
                placeholder="Escreva sua resposta... Seja claro e respeitoso."
              />
            </div>
          </>
        )}
        
        {topic.is_locked && (
          <div className="mt-6 p-4 bg-muted rounded-md text-center">
            Este tópico está bloqueado para novas respostas.
          </div>
        )}
        
        {!profile && (
          <div className="mt-6 p-4 bg-muted rounded-md text-center">
            Faça login para responder a este tópico.
          </div>
        )}
      </div>
    </div>
  );
};
