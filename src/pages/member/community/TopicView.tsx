
import { useParams, Link } from 'react-router-dom';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { CommunityNavigation } from '@/components/community/CommunityNavigation';
import { PostItem } from '@/components/community/PostItem';
import { ReplyForm } from '@/components/community/ReplyForm';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { useTopicDetails } from '@/hooks/community/useTopicDetails';
import { useAuth } from '@/contexts/auth';
import { getInitials } from '@/utils/user';

const TopicView = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const { topic, posts, isLoading, error, markAsSolved, isMarkingSolved } = useTopicDetails(id!);

  const handleMarkAsSolution = (postId: string) => {
    markAsSolved(postId);
  };

  const canMarkAsSolution = (postUserId: string) => {
    return topic && (
      topic.user_id === user?.id || // Autor do tópico
      user?.user_metadata?.role === 'admin' // Admin
    ) && !topic.is_solved;
  };

  const isPostAuthor = (postUserId: string) => {
    return postUserId === user?.id;
  };

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-6">
        <div className="space-y-4">
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
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="container max-w-7xl mx-auto py-6">
        <div className="text-center py-10">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Tópico não encontrado</h1>
          <p className="text-muted-foreground mb-6">O tópico que você está procurando não existe ou foi removido.</p>
          <Button asChild>
            <Link to="/comunidade">Voltar para a Comunidade</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-6">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/comunidade" className="flex items-center">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para a Comunidade
          </Link>
        </Button>
      </div>

      <ForumBreadcrumbs 
        categoryName={topic.category?.name} 
        categorySlug={topic.category?.slug}
        topicTitle={topic.title}
      />
      
      <div className="mt-6">
        {/* Cabeçalho do Tópico */}
        <div className="flex items-start gap-2 mb-4">
          <MessageSquare className="h-6 w-6 text-primary mt-1" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
              {topic.is_pinned && <span className="text-primary">[Fixo]</span>}
              {topic.is_locked && <span className="text-muted-foreground">[Trancado]</span>}
              {topic.title}
              {topic.is_solved && (
                <Badge className="bg-green-600 hover:bg-green-500 gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Resolvido
                </Badge>
              )}
            </h1>
            
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{topic.view_count} visualizações</span>
              <span>•</span>
              <span>{topic.reply_count} respostas</span>
              <span>•</span>
              <span>Criado em {format(new Date(topic.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
            </div>
          </div>
        </div>

        {/* Post Principal do Tópico */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={topic.profiles?.avatar_url || undefined} />
              <AvatarFallback>{getInitials(topic.profiles?.name || 'Usuário')}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{topic.profiles?.name || 'Usuário'}</span>
                <Badge variant="outline" className="text-xs">Autor</Badge>
                {topic.profiles?.role === 'admin' && (
                  <Badge variant="default" className="text-xs">Admin</Badge>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {format(new Date(topic.created_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
          </div>
          
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: topic.content }} />
          </div>
        </div>
        
        {/* Respostas */}
        {posts && posts.length > 0 && (
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-semibold">Respostas ({posts.length})</h2>
            {posts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                canMarkAsSolution={canMarkAsSolution(post.user_id)}
                isAuthor={isPostAuthor(post.user_id)}
                onMarkAsSolution={() => handleMarkAsSolution(post.id)}
                isMarkingSolved={isMarkingSolved}
              />
            ))}
          </div>
        )}
        
        {/* Formulário de Resposta */}
        {!topic.is_locked ? (
          <div>
            <h3 className="text-lg font-medium mb-4">Sua resposta</h3>
            <ReplyForm 
              topicId={topic.id} 
              onPostCreated={() => {
                // A query será invalidada automaticamente pelo hook
              }}
            />
          </div>
        ) : (
          <div className="p-4 bg-muted rounded-md text-center">
            <p className="text-muted-foreground">Este tópico está bloqueado. Não é possível adicionar novas respostas.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicView;
