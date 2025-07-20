import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, MessageSquare, Lock, Users } from "lucide-react";
import { PostItem } from "@/components/community/PostItem";
import { ReplyForm } from "@/components/community/ReplyForm";
import { DeleteConfirmationDialog } from "@/components/community/DeleteConfirmationDialog";
import { useAuth } from "@/contexts/auth";
import { usePostInteractions } from "@/hooks/usePostInteractions";
import { toast } from "sonner";
import { Post, Topic } from "@/types/forumTypes";
interface TopicWithDetails extends Topic {
  forum_categories?: {
    id: string;
    name: string;
    slug: string;
  };
}
const TopicView = () => {
  const {
    topicId
  } = useParams<{
    topicId: string;
  }>();
  const {
    user,
    profile
  } = useAuth();
  const queryClient = useQueryClient();
  console.log("TopicView: parâmetro topicId da URL:", topicId);

  // Incrementar visualizações do tópico
  useEffect(() => {
    if (topicId && user?.id) {
      const incrementViews = async () => {
        try {
          console.log("TopicView: incrementando visualizações para tópico:", topicId);
          const {
            error
          } = await supabase.rpc('increment_topic_views', {
            topic_id: topicId
          });
          if (error) console.error('Erro ao incrementar visualizações:', error);
        } catch (error) {
          console.error('Erro ao incrementar visualizações:', error);
        }
      };
      incrementViews();
    }
  }, [topicId, user?.id]);

  // Buscar dados do tópico - Corrigindo a query para usar joins manuais
  const {
    data: topic,
    isLoading: topicLoading,
    error: topicError
  } = useQuery({
    queryKey: ['topic', topicId],
    queryFn: async (): Promise<TopicWithDetails> => {
      console.log("TopicView: buscando tópico com ID:", topicId);
      if (!topicId) {
        console.error("TopicView: topicId está undefined");
        throw new Error('ID do tópico não fornecido');
      }

      // Buscar o tópico principal
      const {
        data: topicData,
        error: topicError
      } = await supabase.from('forum_topics').select('*').eq('id', topicId).single();
      if (topicError) {
        console.error("TopicView: erro na query do tópico:", topicError);
        throw topicError;
      }
      if (!topicData) {
        console.error("TopicView: nenhum dado retornado para o tópico");
        throw new Error('Tópico não encontrado');
      }

      // Buscar o perfil do usuário
      const {
        data: profileData
      } = await supabase.from('profiles').select('*').eq('id', topicData.user_id).single();

      // Buscar a categoria
      const {
        data: categoryData
      } = await supabase.from('forum_categories').select('id, name, slug').eq('id', topicData.category_id).single();
      console.log("TopicView: dados carregados com sucesso:", {
        topic: topicData.title,
        profile: profileData?.name,
        category: categoryData?.name
      });
      return {
        ...topicData,
        profiles: profileData,
        forum_categories: categoryData
      };
    },
    enabled: !!topicId
  });

  // Buscar posts do tópico - Corrigindo a query para usar joins manuais
  const {
    data: posts,
    isLoading: postsLoading,
    error: postsError,
    refetch: refetchPosts
  } = useQuery({
    queryKey: ['posts', topicId],
    queryFn: async (): Promise<Post[]> => {
      console.log("TopicView: buscando posts para tópico:", topicId);
      if (!topicId) {
        console.error("TopicView: topicId está undefined para buscar posts");
        throw new Error('ID do tópico não fornecido');
      }

      // Buscar os posts
      const {
        data: postsData,
        error: postsError
      } = await supabase.from('forum_posts').select('*').eq('topic_id', topicId).order('created_at', {
        ascending: true
      });
      if (postsError) {
        console.error("TopicView: erro na query dos posts:", postsError);
        throw postsError;
      }
      if (!postsData) return [];

      // Buscar perfis dos usuários dos posts
      const userIds = [...new Set(postsData.map(post => post.user_id))];
      const {
        data: profilesData
      } = await supabase.from('profiles').select('*').in('id', userIds);

      // Mapear posts com perfis
      const postsWithProfiles = postsData.map(post => ({
        ...post,
        profiles: profilesData?.find(profile => profile.id === post.user_id) || null
      }));
      console.log("TopicView: posts carregados:", postsWithProfiles.length);
      return postsWithProfiles;
    },
    enabled: !!topicId
  });
  const isLoading = topicLoading || postsLoading;
  const error = topicError || postsError;

  // Verificações de permissão
  const isTopicAuthor = user?.id === topic?.user_id;
  const isAdmin = profile?.role === 'admin';
  const handleReplyAdded = () => {
    refetchPosts();
    // Invalidar cache do tópico para atualizar contadores
    queryClient.invalidateQueries({
      queryKey: ['topic', topicId]
    });
    queryClient.invalidateQueries({
      queryKey: ['topics']
    });
  };
  console.log("TopicView: estado atual:", {
    topicId,
    isLoading,
    error: error?.message,
    topicFound: !!topic,
    topicTitle: topic?.title
  });
  if (isLoading) {
    return <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-8 bg-muted rounded w-3/4"></div>
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-muted rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>;
  }
  if (error || !topic) {
    console.error("TopicView: renderizando estado de erro:", {
      error: error?.message,
      topic: !!topic
    });
    return <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Tópico não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            O tópico que você está procurando não existe ou foi removido.
          </p>
          <Button asChild>
            <Link to="/comunidade">Voltar para a Comunidade</Link>
          </Button>
        </div>
      </div>;
  }
  console.log("TopicView: renderizando tópico com sucesso:", topic.title);
  return <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/comunidade" className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Comunidade
          </Link>
        </Button>
        <span className="text-muted-foreground">/</span>
        {topic.forum_categories && <>
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/comunidade/categoria/${topic.forum_categories.slug}`} className="flex items-center gap-1">
                {topic.forum_categories.name}
              </Link>
            </Button>
            <span className="text-muted-foreground">/</span>
          </>}
        <span className="text-sm text-muted-foreground truncate max-w-[200px]">
          {topic.title}
        </span>
      </div>

      {/* Cabeçalho do tópico */}
      <div className="mb-6">
        <div className="flex items-start gap-3 mb-4">
          <MessageSquare className="h-6 w-6 text-viverblue mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold leading-tight break-words text-slate-100">
              {topic.title}
            </h1>
            
            {/* Badges do tópico */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {topic.is_pinned && <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                  📌 Fixado
                </span>}
              {topic.is_locked && <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-md">
                  <Lock className="h-3 w-3" />
                  Travado
                </span>}
              {topic.is_solved && <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md">
                  ✓ Resolvido
                </span>}
            </div>

            {/* Estatísticas */}
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {topic.view_count || 0} visualizações
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {topic.reply_count || 0} respostas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Post principal do tópico */}
      <div className="mb-8">
        <PostItem post={{
        id: topic.id,
        content: topic.content,
        created_at: topic.created_at,
        updated_at: topic.updated_at,
        user_id: topic.user_id,
        topic_id: topic.id,
        profiles: topic.profiles
      }} showTopicContext={false} />
      </div>

      {/* Lista de respostas */}
      {posts && posts.length > 0 && <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {posts.length} {posts.length === 1 ? 'Resposta' : 'Respostas'}
          </h2>
          
          <div className="space-y-4">
            {posts.map(post => <PostItem key={post.id} post={post} showTopicContext={false} />)}
          </div>
        </div>}

      {/* Formulário de resposta */}
      {!topic.is_locked ? <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Adicionar resposta</h3>
          <ReplyForm topicId={topic.id} onSuccess={handleReplyAdded} />
        </div> : <div className="border-t pt-6">
          <div className="bg-muted/50 border border-dashed rounded-lg p-6 text-center">
            <Lock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              Este tópico está travado e não permite novas respostas.
            </p>
          </div>
        </div>}
    </div>;
};
export default TopicView;