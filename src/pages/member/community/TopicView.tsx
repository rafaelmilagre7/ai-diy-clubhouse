
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ForumLayout } from "@/components/community/ForumLayout";
import { PostItem } from "@/components/community/PostItem";
import { ReplyForm } from "@/components/community/ReplyForm";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MessageSquare, ThumbsUp, Eye, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  category_id: string;
  is_locked: boolean;
  is_pinned: boolean;
  view_count: number;
  reply_count: number;
  profiles: {
    name: string | null;
    avatar_url: string | null;
  } | null;
  forum_categories: {
    name: string;
    slug: string;
  } | null;
}

interface ForumPost {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  is_solution: boolean;
  profiles: {
    name: string | null;
    avatar_url: string | null;
  } | null;
  reactions: {
    id: string;
    user_id: string;
    reaction_type: string;
  }[];
  reaction_count?: number;
  user_has_reacted?: boolean;
}

const TopicView = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  // Incrementar visualizações
  useEffect(() => {
    if (id) {
      const incrementView = async () => {
        try {
          await supabase.rpc('increment_topic_views', { topic_id: id });
          console.log("Visualização do tópico contabilizada");
        } catch (error) {
          console.error("Erro ao incrementar visualização:", error);
          // Não falhar se não conseguir incrementar visualização
        }
      };
      incrementView();
    }
  }, [id]);

  // Buscar o tópico
  const { data: topic, isLoading: topicLoading, error: topicError } = useQuery({
    queryKey: ['forumTopic', id],
    queryFn: async () => {
      console.log("Buscando detalhes do tópico:", id);
      
      if (!id) {
        throw new Error("ID do tópico não fornecido");
      }
      
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles:user_id(*),
          forum_categories:category_id(name, slug)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Erro ao buscar tópico:", error);
        throw error;
      }
      
      console.log("Tópico encontrado:", data);
      return data as ForumTopic;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Buscar posts/respostas do tópico
  const { data: posts, isLoading: postsLoading, error: postsError } = useQuery({
    queryKey: ['forumPosts', id],
    queryFn: async () => {
      console.log("Buscando posts do tópico:", id);
      
      // Buscar posts com reações
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:user_id(*),
          reactions:forum_reactions(*)
        `)
        .eq('topic_id', id)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error("Erro ao buscar posts:", error);
        throw error;
      }
      
      console.log("Posts encontrados:", data?.length);
      
      // Processar dados para adicionar informações de reação do usuário atual
      return data.map(post => {
        const userReaction = post.reactions?.find(
          (r: any) => r.user_id === user?.id
        );
        
        return {
          ...post,
          reaction_count: post.reactions?.length || 0,
          user_has_reacted: !!userReaction
        };
      }) as ForumPost[];
    },
    enabled: !!id && !!topic,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const isLoading = topicLoading || postsLoading;
  const error = topicError || postsError;

  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  
  useEffect(() => {
    // Mostrar erro se não conseguir carregar o tópico
    if (topicError) {
      toast.error("Não foi possível carregar o tópico. Tente novamente mais tarde.");
      console.error("Erro ao carregar tópico:", topicError);
    }
    
    // Mostrar erro se não conseguir carregar os posts
    if (postsError && topic) {
      toast.error("Não foi possível carregar as respostas. Tente novamente mais tarde.");
      console.error("Erro ao carregar posts:", postsError);
    }
  }, [topicError, postsError, topic]);

  if (isLoading) {
    return (
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Carregando tópico...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <div className="text-center py-10">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold mt-4">Tópico não encontrado</h1>
          <p className="text-muted-foreground mt-2 mb-6">O tópico que você está procurando não existe ou foi removido.</p>
          <Button asChild>
            <Link to="/comunidade">Voltar para a Comunidade</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Verificar se o usuário é o autor do tópico
  const isTopicAuthor = user?.id === topic.user_id;

  // Converter a slug de categoria para o novo formato de URL
  const categoryUrl = `/comunidade/categoria/${topic.forum_categories?.slug}`;

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" asChild className="p-0">
          <Link to={categoryUrl} className="flex items-center">
            <ChevronLeft className="h-4 w-4" />
            <span>Voltar para {topic.forum_categories?.name || "Categorias"}</span>
          </Link>
        </Button>
      </div>
      
      <Card className="p-6 mb-6">
        {/* Cabeçalho do Tópico */}
        <div className="flex justify-between mb-4">
          <div className="flex gap-3">
            <Avatar>
              <AvatarImage src={topic.profiles?.avatar_url || undefined} />
              <AvatarFallback>{getInitials(topic.profiles?.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{topic.profiles?.name || "Usuário"}</p>
                <span className="text-muted-foreground text-xs">•</span>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(topic.created_at), "d 'de' MMMM 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {topic.is_pinned && (
              <Badge variant="info" className="text-xs px-2 py-0.5 rounded-full">
                Fixo
              </Badge>
            )}
            {topic.is_locked && (
              <Badge variant="neutral" className="text-xs px-2 py-0.5 rounded-full">
                Trancado
              </Badge>
            )}
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-4">{topic.title}</h1>
        <div className="whitespace-pre-wrap mb-6">{topic.content}</div>
        
        <div className="flex items-center gap-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{topic.reply_count} respostas</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{topic.view_count} visualizações</span>
          </div>
        </div>
      </Card>
      
      {/* Respostas/comentários */}
      {posts && posts.length > 0 ? (
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold">Respostas</h2>
          {posts.map(post => (
            <PostItem
              key={post.id}
              post={post}
              isTopicAuthor={post.user_id === topic.user_id}
              canMarkSolution={isTopicAuthor}
              topicId={topic.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 mb-6">
          <p className="text-muted-foreground">Seja o primeiro a responder este tópico.</p>
        </div>
      )}
      
      {/* Formulário de resposta */}
      {!topic.is_locked ? (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Sua resposta</h3>
          <ReplyForm 
            topicId={topic.id} 
            onSuccess={() => {
              console.log("Resposta enviada com sucesso");
            }}
          />
        </div>
      ) : (
        <div className="mt-6 p-4 bg-muted rounded-md text-center">
          <p className="text-muted-foreground">Este tópico está bloqueado. Não é possível adicionar novas respostas.</p>
        </div>
      )}
    </div>
  );
};

export default TopicView;
