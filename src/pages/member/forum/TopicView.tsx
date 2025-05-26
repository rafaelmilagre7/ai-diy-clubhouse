
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ForumLayout } from "@/components/forum/ForumLayout";
import { PostItem } from "@/components/community/PostItem";
import { ReplyForm } from "@/components/forum/ReplyForm";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MessageSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth";

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  category_id: string;
  is_locked: boolean;
  profiles: {
    id: string;
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
  updated_at: string;
  user_id: string;
  topic_id: string;
  parent_id: string | null;
  is_solution: boolean;
  profiles: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  } | null;
  reactions: {
    id: string;
    user_id: string;
    reaction_type: string;
  }[];
}

const TopicView = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  // Incrementar visualizações
  useEffect(() => {
    if (id) {
      const incrementView = async () => {
        await supabase.rpc('increment_topic_views', { topic_id: id });
      };
      incrementView();
    }
  }, [id]);

  // Buscar o tópico
  const { data: topic, isLoading: topicLoading, error: topicError } = useQuery({
    queryKey: ['forumTopic', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles:user_id(id, name, avatar_url),
          forum_categories:category_id(name, slug)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as ForumTopic;
    }
  });

  // Buscar posts/respostas do tópico
  const { data: posts, isLoading: postsLoading, error: postsError } = useQuery({
    queryKey: ['forumPosts', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:user_id(id, name, avatar_url),
          reactions:forum_reactions(*)
        `)
        .eq('topic_id', id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Processar dados para adicionar informações de reação do usuário atual
      return data.map(post => {
        const userReaction = post.reactions?.find(
          (r: any) => r.user_id === user?.id
        );
        
        return {
          ...post,
          topic_id: id || '',
          updated_at: post.updated_at || post.created_at,
          reaction_count: post.reactions?.length || 0,
          user_has_reacted: !!userReaction
        };
      }) as ForumPost[];
    },
    enabled: !!id && !!user?.id
  });

  const isLoading = topicLoading || postsLoading;
  const error = topicError || postsError;

  if (isLoading) {
    return (
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded-md w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded-md w-1/2 mb-8"></div>
          <div className="bg-card shadow-sm border-none p-6 rounded-lg mb-6">
            <div className="h-6 bg-muted rounded-md w-1/3 mb-6"></div>
            <div className="h-4 bg-muted rounded-md w-full mb-3"></div>
            <div className="h-4 bg-muted rounded-md w-full mb-3"></div>
            <div className="h-4 bg-muted rounded-md w-3/4"></div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 border rounded-md">
                <div className="flex justify-between mb-4">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 bg-muted rounded-full"></div>
                    <div>
                      <div className="h-4 bg-muted rounded-md w-24 mb-2"></div>
                      <div className="h-3 bg-muted rounded-md w-40"></div>
                    </div>
                  </div>
                </div>
                <div className="h-4 bg-muted rounded-md w-full mb-3"></div>
                <div className="h-4 bg-muted rounded-md w-full mb-3"></div>
                <div className="h-4 bg-muted rounded-md w-3/4"></div>
              </div>
            ))}
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
            <Link to="/forum">Voltar para o Fórum</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Verificar se o usuário é o autor do tópico
  const isTopicAuthor = user?.id === topic.user_id;

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" asChild className="p-0">
          <Link to={`/forum/category/${topic.forum_categories?.slug}`} className="flex items-center">
            <ChevronLeft className="h-4 w-4" />
            <span>Voltar para {topic.forum_categories?.name}</span>
          </Link>
        </Button>
      </div>
      
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">{topic.title}</h1>
      </div>
      
      <ForumLayout>
        {/* Post inicial do tópico */}
        <PostItem
          post={{
            id: topic.id,
            content: topic.content,
            created_at: topic.created_at,
            updated_at: topic.created_at,
            user_id: topic.user_id,
            topic_id: topic.id,
            profiles: topic.profiles ? {
              id: topic.profiles.id,
              name: topic.profiles.name,
              avatar_url: topic.profiles.avatar_url
            } : null
          }}
          showTopicContext={false}
        />
        
        {/* Respostas/comentários */}
        {posts && posts.length > 0 ? (
          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-semibold">Respostas</h2>
            {posts.map(post => (
              <PostItem
                key={post.id}
                post={{
                  id: post.id,
                  content: post.content,
                  created_at: post.created_at,
                  updated_at: post.updated_at,
                  user_id: post.user_id,
                  topic_id: post.topic_id,
                  is_solution: post.is_solution,
                  profiles: post.profiles ? {
                    id: post.profiles.id,
                    name: post.profiles.name,
                    avatar_url: post.profiles.avatar_url
                  } : null
                }}
                showTopicContext={false}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 text-center py-6">
            <p className="text-muted-foreground">Seja o primeiro a responder este tópico.</p>
          </div>
        )}
        
        {/* Formulário de resposta */}
        {!topic.is_locked && (
          <>
            <Separator className="my-6" />
            <div>
              <h3 className="text-lg font-medium mb-4">Sua resposta</h3>
              <ReplyForm topicId={topic.id} />
            </div>
          </>
        )}
        
        {topic.is_locked && (
          <div className="mt-6 p-4 bg-muted rounded-md text-center">
            <p className="text-muted-foreground">Este tópico está bloqueado. Não é possível adicionar novas respostas.</p>
          </div>
        )}
      </ForumLayout>
    </div>
  );
};

export default TopicView;
