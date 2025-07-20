import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowLeft, Lock, Pin, CheckCircle, MessageCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { PostItem } from "@/components/community/PostItem";
import { ReplyForm } from "@/components/community/ReplyForm";
import { ModerationActions } from "@/components/community/ModerationActions";
import { useAuth } from "@/contexts/auth";
import { useReporting } from "@/hooks/community/useReporting";
import { Topic, Post, UserProfile } from "@/types/forumTypes";

export default function TopicView() {
  const { topicId } = useParams<{ topicId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { openReportModal } = useReporting();

  const fetchTopic = async (topicId: string) => {
    const { data, error } = await supabase
      .from('forum_topics')
      .select(`
        *,
        profiles (
          id,
          name,
          avatar_url
        ),
        category (
          id,
          name
        )
      `)
      .eq('id', topicId)
      .single();

    if (error) {
      console.error("Erro ao buscar tópico:", error);
      throw new Error(error.message);
    }

    return data as Topic;
  };

  const fetchPosts = async (topicId: string) => {
    const { data, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        profiles (
          id,
          name,
          avatar_url
        )
      `)
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Erro ao buscar posts:", error);
      throw new Error(error.message);
    }

    return data as Post[];
  };

  const {
    data: topic,
    isLoading: topicsLoading,
    error: topicsError
  } = useQuery({
    queryKey: ['forumTopic', topicId],
    queryFn: () => fetchTopic(topicId!),
    onSuccess: (data) => {
      if (data) {
        handleViewIncrement(data.id, data.view_count);
      }
    }
  });

  const {
    data: posts,
    isLoading: postsLoading,
    error: postsError
  } = useQuery({
    queryKey: ['forumPosts', topicId],
    queryFn: () => fetchPosts(topicId!)
  });

  const handleViewIncrement = async (topicId: string, currentViewCount: number) => {
    // Verifica se o usuário já viu este tópico (pode usar localStorage ou cookies)
    const hasViewed = localStorage.getItem(`topicViewed_${topicId}`);

    if (!hasViewed) {
      // Incrementa a contagem de visualizações no Supabase
      const { error } = await supabase
        .from('forum_topics')
        .update({ view_count: currentViewCount + 1 })
        .eq('id', topicId);

      if (error) {
        console.error("Erro ao incrementar visualização:", error);
        toast.error("Erro ao atualizar visualização do tópico.");
      } else {
        // Define um indicador de que o usuário viu o tópico
        localStorage.setItem(`topicViewed_${topicId}`, 'true');
      }
    }
  };

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

  const handleModerationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['forumTopic', topicId] });
    queryClient.invalidateQueries({ queryKey: ['forumPosts', topicId] });
  };

  const handleReplySuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['forumPosts', topicId] });
    queryClient.invalidateQueries({ queryKey: ['forumTopic', topicId] });
  };

  if (topicsLoading || postsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Carregando tópico...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (topicsError || postsError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">Erro ao carregar tópico</h2>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar o tópico solicitado.
            </p>
            <Link to="/comunidade">
              <Button>Voltar para Comunidade</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">Tópico não encontrado</h2>
            <p className="text-muted-foreground mb-4">
              O tópico que você está procurando não existe ou foi removido.
            </p>
            <Link to="/comunidade">
              <Button>Voltar para Comunidade</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar o tópico principal como um card especial
  const renderTopicPost = (topic: Topic) => {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={topic.profiles?.avatar_url || ''} />
              <AvatarFallback className="bg-viverblue text-white">
                {getInitials(topic.profiles?.name || 'Usuário')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-foreground">{topic.title}</h1>
                    
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
                    
                    {topic.is_solved && (
                      <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        Resolvido
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground gap-4 mb-4">
                    <span>Por {topic.profiles?.name || 'Usuário'}</span>
                    <span>{formatDate(topic.created_at)}</span>
                    {topic.category && (
                      <Badge variant="outline" className="text-xs">
                        {topic.category.name}
                      </Badge>
                    )}
                  </div>
                </div>

                <ModerationActions
                  type="topic"
                  itemId={topic.id}
                  currentState={{
                    isPinned: topic.is_pinned,
                    isLocked: topic.is_locked,
                    isHidden: false
                  }}
                  onReport={() => openReportModal('topic', topic.id, topic.user_id)}
                  onSuccess={handleModerationSuccess}
                />
              </div>

              <div className="prose max-w-none mb-4">
                <div className="text-foreground whitespace-pre-wrap">
                  {topic.content}
                </div>
              </div>

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
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link 
            to="/comunidade" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Comunidade
          </Link>
        </div>

        {/* Tópico Principal */}
        {renderTopicPost(topic)}

        {/* Separador */}
        <Separator className="my-8" />

        {/* Seção de Respostas */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Respostas ({posts?.length || 0})
            </h2>
          </div>

          {/* Lista de Posts/Respostas */}
          {posts && posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostItem
                  key={post.id}
                  post={post}
                  topicId={topicId}
                  onSuccess={handleReplySuccess}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Ainda não há respostas para este tópico.
              </p>
              <p className="text-sm text-muted-foreground">
                Seja o primeiro a responder!
              </p>
            </div>
          )}

          {/* Formulário de Resposta */}
          {!topic.is_locked && user && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Sua Resposta</h3>
              <ReplyForm
                topicId={topicId!}
                onSuccess={handleReplySuccess}
                placeholder="Compartilhe sua resposta ou dúvida..."
              />
            </div>
          )}

          {topic.is_locked && (
            <div className="mt-8 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Este tópico está travado e não aceita novas respostas.</span>
              </div>
            </div>
          )}

          {!user && (
            <div className="mt-8 p-4 bg-muted rounded-lg">
              <p className="text-muted-foreground text-center">
                <Link to="/login" className="text-viverblue hover:underline">
                  Faça login
                </Link>
                {' '}para participar da discussão.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
