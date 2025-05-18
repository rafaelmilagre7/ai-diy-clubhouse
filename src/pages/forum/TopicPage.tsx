
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ForumHeader } from '@/components/forum/ForumHeader';
import { PostCard } from '@/components/forum/PostCard';
import { PostForm } from '@/components/forum/PostForm';
import { useForumTopic } from '@/hooks/forum/useForumTopic';
import { useForumPosts } from '@/hooks/forum/useForumPosts';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const TopicPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const { data: topic, isLoading: loadingTopic } = useForumTopic(id);
  const { 
    data: posts = [], 
    isLoading: loadingPosts,
    refetch: refetchPosts
  } = useForumPosts(id);

  const handlePostCreated = () => {
    refetchPosts();
  };

  // Renderizar carregamento
  if (loadingTopic) {
    return (
      <div className="container py-8">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full mb-4" />
            <div className="flex justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Renderizar erro de tópico não encontrado
  if (!topic) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-500">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Tópico não encontrado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              O tópico que você está procurando não existe ou foi removido.
            </p>
            <Button onClick={() => navigate('/forum')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Fórum
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formatar data relativa
  const formattedDate = formatDistanceToNow(new Date(topic.created_at), {
    addSuffix: true,
    locale: ptBR
  });

  return (
    <div className="container py-8">
      <ForumHeader 
        title={topic.title}
        breadcrumbs={[
          { name: 'Categorias', href: '/forum' },
          ...(topic.category ? [{ name: topic.category.name, href: `/forum/categoria/${topic.category.slug}` }] : []),
          { name: 'Tópico', href: `/forum/topico/${topic.id}` }
        ]}
      />

      {/* Conteúdo principal do tópico */}
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: topic.content }} />
            </div>
            <div className="flex justify-between items-center mt-6 text-sm text-muted-foreground">
              <div>
                {topic.author?.name || 'Anônimo'} • {formattedDate}
              </div>
              <div>
                {topic.view_count} visualizações
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Respostas */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Respostas ({posts.length})</h2>
          
          {loadingPosts ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-24 w-full mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {posts.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Ainda não há respostas. Seja o primeiro a responder!
                  </CardContent>
                </Card>
              )}
              
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </>
          )}
        </div>

        {/* Formulário de resposta */}
        {profile?.id && !topic.is_locked && (
          <div>
            <h3 className="text-lg font-bold mb-4">Sua resposta</h3>
            <PostForm 
              topicId={topic.id} 
              onPostCreated={handlePostCreated}
            />
          </div>
        )}

        {topic.is_locked && (
          <Card>
            <CardContent className="p-6 text-center text-amber-500">
              Este tópico está bloqueado e não permite novas respostas.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
