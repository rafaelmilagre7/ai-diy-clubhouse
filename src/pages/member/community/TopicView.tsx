import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pin, Lock, CheckCircle, MessageCircle, Eye, ArrowLeft, Calendar } from "lucide-react";
import { PostItem } from "@/components/community/PostItem";
import { ReplyForm } from "@/components/community/ReplyForm";
import { ModerationActions } from "@/components/community/ModerationActions";
import { useReporting } from "@/hooks/community/useReporting";
import { Topic, Post } from "@/types/forumTypes";

export const TopicView = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { openReportModal } = useReporting();

  const { data: topic, isLoading: topicLoading, error: topicError } = useQuery({
    queryKey: ['communityTopic', topicId],
    queryFn: async () => {
      if (!topicId) throw new Error('Topic ID is required');
      
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles!forum_topics_user_id_fkey (
            id,
            name,
            avatar_url
          ),
          category:forum_categories!forum_topics_category_id_fkey (
            id,
            name,
            color
          )
        `)
        .eq('id', topicId)
        .single();

      if (error) throw error;
      return data as Topic;
    },
    enabled: !!topicId
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['communityTopicPosts', topicId],
    queryFn: async () => {
      if (!topicId) return [];
      
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles!forum_posts_user_id_fkey (
            id,
            name,
            avatar_url
          )
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Post[];
    },
    enabled: !!topicId
  });

  React.useEffect(() => {
    if (topic && topicId) {
      // Incrementar contador de visualizações
      const incrementViews = async () => {
        await supabase.rpc('increment_topic_views', { topic_id: topicId });
      };
      incrementViews();
    }
  }, [topic, topicId]);

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

  const handleReplySuccess = () => {
    // Invalidar queries para atualizar a lista de posts
    queryClient.invalidateQueries({ queryKey: ['communityTopicPosts', topicId] });
    queryClient.invalidateQueries({ queryKey: ['communityTopic', topicId] });
    queryClient.invalidateQueries({ queryKey: ['communityTopics'] });
  };

  const handleModerationSuccess = () => {
    // Invalidar queries relacionadas para atualizar a UI
    queryClient.invalidateQueries({ queryKey: ['communityTopic', topicId] });
    queryClient.invalidateQueries({ queryKey: ['communityTopics'] });
    queryClient.invalidateQueries({ queryKey: ['forumTopics'] });
    
    console.log('Queries invalidadas após ação de moderação no tópico');
  };

  if (topicLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (topicError || !topic) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Tópico não encontrado</h2>
          <Button onClick={() => navigate('/comunidade')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Comunidade
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header com botão voltar */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/comunidade')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      {/* Informações do Tópico */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Título com badges */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground flex-1">
                {topic.title}
              </h1>
              
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

            {/* Meta informações */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={topic.profiles?.avatar_url || ''} />
                  <AvatarFallback className="bg-viverblue text-white text-xs">
                    {getInitials(topic.profiles?.name || 'Usuário')}
                  </AvatarFallback>
                </Avatar>
                <span>Por {topic.profiles?.name || 'Usuário'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(topic.created_at)}</span>
              </div>
              {topic.category && (
                <Badge variant="outline" className="text-xs">
                  {topic.category.name}
                </Badge>
              )}
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
              {topic.last_activity_at && (
                <span className="text-xs">
                  Última atividade: {formatDate(topic.last_activity_at)}
                </span>
              )}
            </div>
          </div>

          {/* Ações de Moderação */}
          <div className="flex-shrink-0">
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
        </div>

        {/* Conteúdo do tópico se houver */}
        {topic.content && (
          <div className="prose max-w-none pt-4 border-t">
            <div dangerouslySetInnerHTML={{ __html: topic.content }} />
          </div>
        )}
      </div>

      {/* Lista de Posts/Respostas */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Respostas ({posts.length})
        </h2>
        
        {postsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg border p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
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

      {/* Formulário de Nova Resposta */}
      {!topic.is_locked && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Adicionar Resposta</h3>
          <ReplyForm
            topicId={topic.id}
            onSuccess={handleReplySuccess}
          />
        </div>
      )}

      {topic.is_locked && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <Lock className="h-5 w-5 mx-auto mb-2 text-yellow-600" />
          <p className="text-yellow-800">
            Este tópico está travado e não aceita novas respostas.
          </p>
        </div>
      )}
    </div>
  );
};

export default TopicView;
