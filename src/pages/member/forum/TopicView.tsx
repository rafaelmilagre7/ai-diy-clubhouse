
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ForumLayout } from "@/components/forum/ForumLayout";
import { PostItem } from "@/components/forum/PostItem";
import { ReplyForm } from "@/components/forum/ReplyForm";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useEffect } from "react";

interface ForumPost {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  is_solution: boolean;
  profiles?: {
    name: string | null;
    avatar_url: string | null;
  } | null;
  reaction_count?: number;
  user_has_reacted?: boolean;
}

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  category_id: string;
  view_count: number;
  reply_count: number;
  is_locked: boolean;
  profiles?: {
    name: string | null;
    avatar_url: string | null;
  } | null;
  forum_categories?: {
    name: string;
    slug: string;
  } | null;
}

const TopicView = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  // Buscar detalhes do tópico
  const { data: topic, isLoading: isTopicLoading, error: topicError } = useQuery({
    queryKey: ['forumTopic', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_topics')
        .select('*, profiles:user_id(*), forum_categories:category_id(*)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as ForumTopic;
    }
  });

  // Buscar posts do tópico
  const { data: posts, isLoading: isPostsLoading, error: postsError } = useQuery({
    queryKey: ['forumPosts', id],
    queryFn: async () => {
      // Primeiro, obter todos os posts do tópico
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:user_id(*)
        `)
        .eq('topic_id', id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Se o usuário estiver logado, verificar reações
      if (user?.id) {
        const { data: reactions } = await supabase
          .from('forum_reactions')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', data.map(post => post.id));
        
        const reactedPostIds = (reactions || []).map(r => r.post_id);
        
        // Adicionar informação de reação do usuário a cada post
        return data.map(post => ({
          ...post,
          user_has_reacted: reactedPostIds.includes(post.id)
        })) as ForumPost[];
      }
      
      return data as ForumPost[];
    },
    enabled: !!id
  });

  // Incrementar contador de visualizações do tópico
  useEffect(() => {
    if (topic && id) {
      const incrementViews = async () => {
        await supabase.rpc('increment_topic_views', { topic_id: id });
      };
      
      incrementViews();
    }
  }, [topic, id]);

  if (isTopicLoading || isPostsLoading) {
    return (
      <div className="container px-4 py-6 mx-auto max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded-md w-1/2 mb-4"></div>
          <div className="h-4 bg-muted rounded-md w-1/3 mb-8"></div>
          <div className="bg-card shadow-sm border-none p-6 rounded-lg mb-4">
            <div className="h-4 bg-muted rounded-md w-full mb-2"></div>
            <div className="h-4 bg-muted rounded-md w-full mb-2"></div>
            <div className="h-4 bg-muted rounded-md w-2/3"></div>
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card shadow-sm border-none p-6 rounded-lg mb-4">
              <div className="h-4 bg-muted rounded-md w-full mb-2"></div>
              <div className="h-4 bg-muted rounded-md w-full mb-2"></div>
              <div className="h-4 bg-muted rounded-md w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (topicError || !topic) {
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

  // Verificar se o tópico está bloqueado
  const isLocked = topic.is_locked;
  
  // Verificar se o usuário atual é o autor do tópico
  const isTopicAuthor = user?.id === topic.user_id;

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <div className="flex items-center gap-2 mb-4">
        {topic.forum_categories && (
          <Button variant="ghost" size="sm" asChild className="p-0">
            <Link to={`/forum/category/${topic.forum_categories.slug}`} className="flex items-center">
              <ChevronLeft className="h-4 w-4" />
              <span>Voltar para {topic.forum_categories.name}</span>
            </Link>
          </Button>
        )}
      </div>
      
      <div className="mb-1">
        <h1 className="text-3xl font-bold">{topic.title}</h1>
      </div>
      
      <div className="text-sm text-muted-foreground mb-6">
        <span>
          Iniciado por {topic.profiles?.name || "Usuário Anônimo"} • 
          {new Date(topic.created_at).toLocaleDateString('pt-BR')} • 
          {topic.view_count} {topic.view_count === 1 ? 'visualização' : 'visualizações'} • 
          {topic.reply_count} {topic.reply_count === 1 ? 'resposta' : 'respostas'}
        </span>
      </div>
      
      <div className="space-y-6">
        {/* Primeiro post (o tópico em si) */}
        <PostItem 
          post={{
            id: 'topic-' + topic.id,
            content: topic.content,
            created_at: topic.created_at,
            user_id: topic.user_id,
            profiles: topic.profiles
          }}
          isTopicStarter={true}
          topicId={topic.id}
        />
        
        {/* Respostas ao tópico */}
        {posts && posts.length > 0 && (
          <div className="space-y-4 mt-6">
            {posts.map((post) => (
              <PostItem 
                key={post.id} 
                post={post} 
                isTopicAuthor={isTopicAuthor}
                canMarkSolution={isTopicAuthor}
                topicId={topic.id}
              />
            ))}
          </div>
        )}
        
        {/* Formulário de resposta */}
        {!isLocked && (
          <ForumLayout title="Sua resposta">
            <ReplyForm topicId={topic.id} />
          </ForumLayout>
        )}
        
        {isLocked && (
          <div className="text-center py-4 bg-muted/30 rounded-md">
            <p className="text-muted-foreground">
              Este tópico está bloqueado. Não é possível adicionar novas respostas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicView;
