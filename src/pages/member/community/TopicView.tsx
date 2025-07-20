
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PostItem, ReplyForm } from '@/components/community';
import { ArrowLeft, Pin, Lock, CheckCircle, MessageCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Topic, Post } from '@/types/forumTypes';

export const TopicView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [hasIncrementedView, setHasIncrementedView] = useState(false);

  // Query para buscar o tópico
  const { data: topic, isLoading: topicLoading, error: topicError } = useQuery({
    queryKey: ['forumTopic', id],
    queryFn: async () => {
      if (!id) throw new Error('ID do tópico não fornecido');
      
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            avatar_url
          ),
          category:category_id (
            id,
            name,
            slug,
            description
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Topic;
    },
    enabled: !!id,
  });

  // Query para buscar os posts do tópico
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['forumPosts', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            avatar_url
          )
        `)
        .eq('topic_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Post[];
    },
    enabled: !!id,
  });

  // Incrementar visualizações quando o tópico carrega
  useEffect(() => {
    if (topic && !hasIncrementedView) {
      const incrementViews = async () => {
        try {
          await supabase
            .from('forum_topics')
            .update({ view_count: (topic.view_count || 0) + 1 })
            .eq('id', topic.id);
          
          setHasIncrementedView(true);
        } catch (error) {
          console.error('Erro ao incrementar visualizações:', error);
        }
      };

      incrementViews();
    }
  }, [topic, hasIncrementedView]);

  // Mutação para atualizar tópico
  const updateTopicMutation = useMutation({
    mutationFn: async (updates: Partial<Topic>) => {
      const { error } = await supabase
        .from('forum_topics')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumTopic', id] });
      queryClient.invalidateQueries({ queryKey: ['communityTopics'] });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const isOwner = topic && user && topic.user_id === user.id;
  const isAdmin = user?.id; // Simplificado - ajustar conforme sua lógica de admin

  const handleTogglePin = () => {
    if (!topic) return;
    updateTopicMutation.mutate({ is_pinned: !topic.is_pinned });
    toast.success(topic.is_pinned ? 'Tópico desfixado' : 'Tópico fixado');
  };

  const handleToggleLock = () => {
    if (!topic) return;
    updateTopicMutation.mutate({ is_locked: !topic.is_locked });
    toast.success(topic.is_locked ? 'Tópico desbloqueado' : 'Tópico bloqueado');
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['forumTopic', id] });
    queryClient.invalidateQueries({ queryKey: ['forumPosts', id] });
  };

  // Renderizar o post principal (tópico)
  const renderTopicPost = () => {
    if (!topic) return null;

    return (
      <div className="p-6 border rounded-lg bg-card">
        {/* Header do Post Principal */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={topic.profiles?.avatar_url || ''} />
            <AvatarFallback className="bg-viverblue text-white">
              {getInitials(topic.profiles?.name || 'Usuário')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">{topic.profiles?.name || 'Usuário'}</span>
              <span className="text-sm text-muted-foreground">
                {formatDate(topic.created_at)}
              </span>
              {topic.is_solved && (
                <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3" />
                  Resolvido
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Conteúdo do Tópico */}
        <div className="prose prose-sm max-w-none mb-4">
          <div className="whitespace-pre-wrap">{topic.content}</div>
        </div>

        {/* Estatísticas */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{topic.reply_count || 0} respostas</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{topic.view_count || 0} visualizações</span>
          </div>
        </div>
      </div>
    );
  };

  if (topicLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (topicError || !topic) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Tópico não encontrado</h2>
            <p className="text-muted-foreground mb-6">
              O tópico que você está procurando não existe ou foi removido.
            </p>
            <Button onClick={() => navigate('/comunidade')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Comunidade
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/comunidade')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            
            {topic.category && (
              <Badge variant="outline">
                {topic.category.name}
              </Badge>
            )}
          </div>

          {(isOwner || isAdmin) && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTogglePin}
                disabled={updateTopicMutation.isPending}
              >
                <Pin className="h-4 w-4 mr-2" />
                {topic.is_pinned ? 'Desfixar' : 'Fixar'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleLock}
                disabled={updateTopicMutation.isPending}
              >
                <Lock className="h-4 w-4 mr-2" />
                {topic.is_locked ? 'Desbloquear' : 'Bloquear'}
              </Button>
            </div>
          )}
        </div>

        {/* Título do Tópico */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold">{topic.title}</h1>
            
            {topic.is_pinned && (
              <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-700">
                <Pin className="h-3 w-3" />
                Fixado
              </Badge>
            )}
            
            {topic.is_locked && (
              <Badge variant="secondary" className="gap-1 bg-red-100 text-red-700">
                <Lock className="h-3 w-3" />
                Travado
              </Badge>
            )}
          </div>
        </div>

        {/* Post Principal (Tópico) */}
        {renderTopicPost()}

        <Separator className="my-8" />

        {/* Respostas */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">
            Respostas ({posts.length})
          </h2>

          {postsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostItem
                  key={post.id}
                  post={post}
                  onSuccess={handleRefresh}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma resposta ainda. Seja o primeiro a responder!</p>
            </div>
          )}
        </div>

        {/* Formulário de Resposta */}
        {!topic.is_locked && user && (
          <>
            <Separator className="my-8" />
            <div>
              <h3 className="text-lg font-semibold mb-4">Sua Resposta</h3>
              <ReplyForm
                topicId={topic.id}
                onSuccess={handleRefresh}
              />
            </div>
          </>
        )}

        {topic.is_locked && (
          <div className="mt-8 p-4 bg-muted rounded-lg text-center">
            <Lock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">
              Este tópico está bloqueado e não aceita novas respostas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
