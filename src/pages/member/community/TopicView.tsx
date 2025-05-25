
import { useParams, useNavigate } from 'react-router-dom';
import { ForumBreadcrumbs } from '@/components/community/ForumBreadcrumbs';
import { PostItem } from '@/components/community/PostItem';
import { ReplyForm } from '@/components/community/ReplyForm';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, MessageSquare, CheckCircle, AlertCircle, Eye, Clock, Pin, Lock } from 'lucide-react';
import { useTopicDetails } from '@/hooks/community/useTopicDetails';
import { useAuth } from '@/contexts/auth';
import { getInitials } from '@/utils/user';

const TopicView = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
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
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-32" />
          </div>
          <Skeleton className="h-6 w-3/4" />
          <Card className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-32 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/comunidade')}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para a Comunidade
          </Button>
        </div>
        
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error ? 'Erro ao carregar o tópico. Tente novamente.' : 'Tópico não encontrado ou foi removido.'}
          </AlertDescription>
        </Alert>
        
        <div className="text-center py-10">
          <div className="max-w-md mx-auto">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Tópico não encontrado</h1>
            <p className="text-muted-foreground mb-6">O tópico que você está procurando não existe ou foi removido.</p>
            <Button onClick={() => navigate('/comunidade')}>
              Voltar para a Comunidade
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/comunidade')}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar para a Comunidade
        </Button>
      </div>

      <ForumBreadcrumbs 
        categoryName={topic.category?.name} 
        categorySlug={topic.category?.slug}
        topicTitle={topic.title}
      />
      
      <div className="mt-6 space-y-6">
        {/* Cabeçalho do Tópico */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {topic.is_pinned && (
                  <Badge variant="outline" className="text-primary border-primary gap-1">
                    <Pin className="h-3 w-3" />
                    Fixo
                  </Badge>
                )}
                {topic.is_locked && (
                  <Badge variant="outline" className="text-muted-foreground gap-1">
                    <Lock className="h-3 w-3" />
                    Trancado
                  </Badge>
                )}
                {topic.is_solved && (
                  <Badge className="bg-green-600 hover:bg-green-500 gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Resolvido
                  </Badge>
                )}
              </div>
              
              <h1 className="text-2xl font-bold mb-3">{topic.title}</h1>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{topic.view_count} visualizações</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{topic.reply_count} respostas</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Criado em {format(new Date(topic.created_at), "d 'de' MMMM", { locale: ptBR })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Autor e Conteúdo Principal */}
          <div className="flex items-start gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={topic.profiles?.avatar_url || undefined} />
              <AvatarFallback>{getInitials(topic.profiles?.name || 'Usuário')}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
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
          
          <Card className="bg-muted/20">
            <CardContent className="p-4">
              <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: topic.content }} />
              </div>
            </CardContent>
          </Card>
        </Card>
        
        {/* Respostas */}
        {posts && posts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Respostas ({posts.length})</h2>
            {posts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                canMarkAsSolution={canMarkAsSolution(post.user_id)}
                isAuthor={isPostAuthor(post.user_id)}
                onMarkAsSolution={() => handleMarkAsSolution(post.id)}
                isMarkingSolved={isMarkingSolved}
                topicId={topic.id}
              />
            ))}
          </div>
        )}
        
        {/* Formulário de Resposta */}
        {!topic.is_locked ? (
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Sua resposta</h3>
            <ReplyForm 
              topicId={topic.id} 
              onPostCreated={() => {
                // A query será invalidada automaticamente pelo hook
              }}
            />
          </Card>
        ) : (
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Este tópico está bloqueado. Não é possível adicionar novas respostas.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default TopicView;
