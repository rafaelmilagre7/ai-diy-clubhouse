
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { ReplyForm } from "@/components/community/ReplyForm";
import { PostItem } from "@/components/community/PostItem";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pin, Lock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getInitials } from "@/utils/user";

export default function TopicView() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar dados do tópico
  const { data: topic, isLoading: topicLoading } = useQuery({
    queryKey: ['forumTopic', topicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles (
            id,
            name,
            avatar_url
          ),
          category:forum_categories (
            id,
            name,
            slug
          )
        `)
        .eq('id', topicId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!topicId
  });

  // Buscar posts do tópico
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['forumPosts', topicId],
    queryFn: async () => {
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

      if (error) throw error;
      return data;
    },
    enabled: !!topicId
  });

  // Incrementar visualizações quando a página carregar
  useEffect(() => {
    if (topicId && user) {
      supabase.rpc('increment_topic_views', { topic_id: topicId });
    }
  }, [topicId, user]);

  const handlePostCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['forumPosts', topicId] });
    queryClient.invalidateQueries({ queryKey: ['forumTopic', topicId] });
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  };

  if (topicLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Tópico não encontrado</h1>
          <Button onClick={() => navigate('/comunidade')}>
            Voltar para a comunidade
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Botão Voltar */}
      <Button
        variant="ghost"
        onClick={() => navigate('/comunidade')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para a comunidade
      </Button>

      {/* Cabeçalho do Tópico */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={topic.profiles?.avatar_url || ''} />
            <AvatarFallback className="bg-viverblue text-white">
              {getInitials(topic.profiles?.name || 'Usuário')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
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
              
              {topic.is_solved && (
                <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3" />
                  Resolvido
                </Badge>
              )}
            </div>

            <div className="flex items-center text-sm text-muted-foreground gap-4 flex-wrap">
              <span>Por {topic.profiles?.name || 'Usuário'}</span>
              <span>{formatDate(topic.created_at)}</span>
              {topic.category && (
                <Badge variant="outline" className="text-xs">
                  {topic.category.name}
                </Badge>
              )}
            </div>

            <div className="mt-4">
              <p className="text-foreground whitespace-pre-wrap">{topic.content}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Posts */}
      <div className="space-y-4 mb-6">
        {postsLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              topicAuthorId={topic.user_id}
              onReplySuccess={handlePostCreated}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Ainda não há respostas neste tópico.</p>
            <p>Seja o primeiro a responder!</p>
          </div>
        )}
      </div>

      {/* Formulário de Nova Resposta */}
      {user && !topic.is_locked && (
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Adicionar Resposta</h3>
          <ReplyForm
            topicId={topicId!}
            onSuccess={handlePostCreated}
            placeholder="Escreva sua resposta ao tópico..."
          />
        </div>
      )}

      {topic.is_locked && (
        <div className="bg-muted/50 border rounded-lg p-6 text-center">
          <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">
            Este tópico está travado e não aceita novas respostas.
          </p>
        </div>
      )}

      {!user && (
        <div className="bg-muted/50 border rounded-lg p-6 text-center">
          <p className="text-muted-foreground">
            Você precisa estar logado para responder a este tópico.
          </p>
        </div>
      )}
    </div>
  );
}
